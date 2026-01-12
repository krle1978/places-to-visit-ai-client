document.addEventListener("DOMContentLoaded", () => {
  // Progress Bar Animation with Milestones
  const progress = document.querySelector(".progress-bar .progress");
  if (progress) {
    let width = 0;
    const target = 64;
    const interval = setInterval(() => {
      if (width >= target) {
        clearInterval(interval);
      } else {
        width += 1;
        progress.style.width = width + "%";
      }
    }, 20);
  }

  // Hamburger Menu Toggle with Slide Animation
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".menu_mobile");

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      if (mobileMenu.classList.contains("open")) {
        mobileMenu.style.maxHeight = mobileMenu.scrollHeight + "px";
        requestAnimationFrame(() => {
          mobileMenu.style.maxHeight = "0";
        });
        mobileMenu.classList.remove("open");
      } else {
        mobileMenu.classList.add("open");
        mobileMenu.style.maxHeight = "0";
        requestAnimationFrame(() => {
          mobileMenu.style.maxHeight = mobileMenu.scrollHeight + "px";
        });
      }
    });

    mobileMenu.addEventListener("transitionend", () => {
      if (!mobileMenu.classList.contains("open")) {
        mobileMenu.style.maxHeight = "";
      } else {
        mobileMenu.style.maxHeight = "";
      }
    });
  }

  // Copy Buttons for Crypto and IBAN
  const copyButtons = document.querySelectorAll(".copy-btn");
  copyButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const text = btn.getAttribute("data-copy");
      navigator.clipboard
        .writeText(text || "")
        .then(() => {
          btn.textContent = "Copied!";
          setTimeout(() => {
            btn.textContent = "Copy";
          }, 1500);
        })
        .catch(() => {});
    });
  });

  // Top Nav Hide/Show on Scroll
  const topNav = document.querySelector(".main-nav");
  if (topNav) {
    let lastScroll = 0;
    window.addEventListener("scroll", () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll <= 0) {
        topNav.style.transform = "translateY(0)";
        return;
      }

      if (currentScroll > lastScroll) {
        topNav.style.transform = "translateY(-100%)";
      } else {
        topNav.style.transform = "translateY(0)";
      }

      lastScroll = currentScroll;
    });
  }

  async function creditTokens(amount) {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("/api/payments/paypal/credit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ amount })
      });

      if (!res.ok) {
        console.warn("Failed to credit tokens", await res.json().catch(() => ({})));
      }
    } catch (err) {
      console.warn("Token credit request failed", err);
    }
  }

  // PayPal Buttons
  function renderPayPalButton(containerId, amount) {
    if (!window.paypal?.Buttons) return;
    window.paypal
      .Buttons({
        style: {
          shape: "pill",
          color: "gold",
          layout: "vertical",
          label: "donate"
        },
        createOrder: function (data, actions) {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: amount.toString(),
                  currency_code: "EUR"
                },
                description: "Donation of EUR " + amount
              }
            ]
          });
        },
        onApprove: function (data, actions) {
          return actions.order.capture().then(async function (details) {
            await creditTokens(amount);
            window.location.href =
              "thankyou.html?amount=" +
              amount +
              "&name=" +
              encodeURIComponent(details.payer.name.given_name);
          });
        },
        onError: function (err) {
          console.error(err);
          alert("There was an error processing the donation.");
        }
      })
      .render(containerId);
  }

  renderPayPalButton("#paypal-button-container-5", 5);
  renderPayPalButton("#paypal-button-container-10", 10);
  renderPayPalButton("#paypal-button-container-20", 20);

  // Bank Transfer QR Code with 10 EUR preset
  const bankQR = document.getElementById("bank-qr");
  if (bankQR && window.QRCode) {
    const epcData = [
      "BCD",
      "001",
      "1",
      "SCT",
      "OTPVRS22",
      "RADE KRSTIC",
      "RS35325934170593551847",
      "EUR10.00",
      "",
      "Donation for Diabetis Project"
    ].join("\n");

    const qr = new window.QRCode(bankQR, {
      text: epcData,
      width: 220,
      height: 220,
      correctLevel: window.QRCode.CorrectLevel.M
    });

    setTimeout(() => {
      const qrCanvas = bankQR.querySelector("canvas");
      if (qrCanvas) {
        const ctx = qrCanvas.getContext("2d");
        ctx.fillStyle = "rgba(255,255,255,0.8)";
        ctx.beginPath();
        ctx.arc(qrCanvas.width / 2, qrCanvas.height / 2, 30, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#000";
        ctx.font = "bold 18px Arial";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText("10€", qrCanvas.width / 2, qrCanvas.height / 2);
      }
    }, 500);
  }
});
