/**
 * ====================================================================
 * Sulton Saroy - JavaScript Asosiy Skripti
 * Vazifasi: Menyuni filtrlash va Formani Telegram Bot orqali yuborish
 * ====================================================================
 */

// -------------------------------------------------------------
// 1. TELEGRAM BOT SOZLAMALARI
// DIQQAT: O'zingizning Telegram Bot Token va Chat ID-ingizni kiriting!
// -------------------------------------------------------------
const TELEGRAM_BOT_TOKEN = "SIZNING_BOT_TOKENINGIZ"; // Masalan: "7123456789:AAFlm..."
const TELEGRAM_CHAT_ID = "SIZNING_CHAT_IDINGIZ";     // Masalan: "123456789" yoki guruh id: "-100..."


// -------------------------------------------------------------
// 2. Mobil Menyuni ochish/yopish (Burger Menyu)
// -------------------------------------------------------------
const mobileToggle = document.getElementById('mobileToggle');
const navMenu = document.getElementById('navMenu');
const navLinks = document.querySelectorAll('.nav-link, .nav-btn');

if (mobileToggle) {
  mobileToggle.addEventListener('click', () => {
    navMenu.classList.toggle('open');
    const icon = mobileToggle.querySelector('i');
    if (navMenu.classList.contains('open')) {
      icon.classList.remove('fa-bars');
      icon.classList.add('fa-xmark');
    } else {
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }
  });
}

// Havola bosilganda mobil menyuni avtomatik yopish
navLinks.forEach(link => {
  link.addEventListener('click', () => {
    if (navMenu.classList.contains('open')) {
      navMenu.classList.remove('open');
      const icon = mobileToggle.querySelector('i');
      icon.classList.remove('fa-xmark');
      icon.classList.add('fa-bars');
    }
  });
});


// -------------------------------------------------------------
// 3. Menyu Taomlarini Filtrlash (Tabs)
// -------------------------------------------------------------
const tabBtns = document.querySelectorAll('.tab-btn');
const menuCards = document.querySelectorAll('.menu-card');

tabBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    // Faol tab tugmasini belgilash
    tabBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const selectedCategory = btn.getAttribute('data-category');

    // Kartalarni ko'rsatish yoki yashirish
    menuCards.forEach(card => {
      const cardCategory = card.getAttribute('data-category');
      if (selectedCategory === 'all' || cardCategory === selectedCategory) {
        card.style.display = 'block';
        card.style.animation = 'fadeIn 0.4s ease forwards';
      } else {
        card.style.display = 'none';
      }
    });
  });
});


// -------------------------------------------------------------
// 4. Stol Bron Qilish va Telegram Botga Yuborish
// -------------------------------------------------------------
const bookingForm = document.getElementById('bookingForm');
const submitBtn = document.getElementById('submitBtn');
const btnText = submitBtn.querySelector('.btn-text');
const btnLoader = submitBtn.querySelector('.btn-loader');
const formStatus = document.getElementById('formStatus');

bookingForm.addEventListener('submit', async function (e) {
  e.preventDefault();

  // Status xabarini tozalash
  formStatus.className = 'form-status';
  formStatus.style.display = 'none';

  // Formadagi ma'lumotlarni olish
  const fullName = document.getElementById('fullName').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const guests = document.getElementById('guests').value;
  const bookingDate = document.getElementById('bookingDate').value;
  const comment = document.getElementById('comment').value.trim() || "Izoh qoldirilmadi";

  // Sana formatini o'qishli ko'rinishga keltirish (YYYY-MM-DDTHH:MM -> DD.MM.YYYY HH:MM)
  let formattedDate = bookingDate;
  if (bookingDate) {
    const d = new Date(bookingDate);
    formattedDate = d.toLocaleString('uz-UZ', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric', 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  // Telegramga yuboriladigan chiroyli xabar formati (HTML teglari bilan)
  const messageText = `
🍽 <b>YANGI STOL BRON QILINDI!</b>
━━━━━━━━━━━━━━━━━━
👤 <b>Mijoz:</b> ${fullName}
📞 <b>Telefon:</b> ${phone}
👥 <b>Mehmonlar:</b> ${guests}
📅 <b>Vaqt:</b> ${formattedDate}
💬 <b>Izoh:</b> ${comment}
━━━━━━━━━━━━━━━━━━
🌐 <i>Manba: Sulton Saroy veb-sayti</i>
  `.trim();

  // Agar token yoki chat_id hali o'zgartirilmagan bo'lsa ogohlantirish
  if (TELEGRAM_BOT_TOKEN === "SIZNING_BOT_TOKENINGIZ" || TELEGRAM_CHAT_ID === "SIZNING_CHAT_IDINGIZ") {
    showStatus(
      "⚠️ Diqqat: app.js fayliga o'zingizning Telegram Bot Token va Chat ID-ingizni kiritishingiz kerak!", 
      "error"
    );
    return;
  }

  // Tugmani yuklanish holatiga o'tkazish
  btnText.style.display = 'none';
  btnLoader.style.display = 'inline-block';
  submitBtn.disabled = true;

  try {
    const telegramApiUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    const response = await fetch(telegramApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: messageText,
        parse_mode: 'HTML'
      })
    });

    const result = await response.json();

    if (result.ok) {
      showStatus("✅ Rahmat! Broningiz qabul qilindi. Tez orada menejerimiz siz bilan bog'lanadi!", "success");
      bookingForm.reset();
    } else {
      console.error("Telegram API Xatosi:", result);
      showStatus("❌ Xatolik yuz berdi. Iltimos qaytadan urinib ko'ring yoki telefon orqali bog'laning.", "error");
    }
  } catch (error) {
    console.error("Tarmoq xatosi:", error);
    showStatus("❌ Xatolik: Internet aloqasini tekshiring yoki keyinroq urinib ko'ring.", "error");
  } finally {
    // Tugmani dastlabki holatga qaytarish
    btnText.style.display = 'inline-block';
    btnLoader.style.display = 'none';
    submitBtn.disabled = false;
  }
});

// Xabar ko'rsatish yordamchi funksiyasi
function showStatus(message, type) {
  formStatus.textContent = message;
  formStatus.className = `form-status ${type}`;
  formStatus.style.display = 'block';

  // 7 soniyadan so'ng xabarni yashirish
  setTimeout(() => {
    formStatus.style.display = 'none';
  }, 7000);
}
