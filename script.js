// آپ کا لائیو گوگل ایپ اسکرپٹ کا Web App URL
const WEB_APP_URL = "https://script.google.com/macros/s/AKfycbwTgMxfbTlqTO8yawhTNUjThtgQN4sUI993Vupokj-6Y6CrrKDFkmdDiugRylwRPWFx/exec";

let currentStudentID = "";

// فارم بدلنے کے فنکشنز (رجسٹریشن اور لاگ ان کے درمیان سوئچ کرنے کے لیے)
function showLogin() {
    document.getElementById("registerSection").classList.add("hidden");
    document.getElementById("loginSection").classList.remove("hidden");
}

function showRegister() {
    document.getElementById("loginSection").classList.add("hidden");
    document.getElementById("registerSection").classList.remove("hidden");
}

// 1. نیا اسٹوڈنٹ رجسٹر کرنے کا فنکشن
async function registerUser() {
    const name = document.getElementById("regName").value;
    const email = document.getElementById("regEmail").value;
    const password = document.getElementById("regPassword").value;
    const course = document.getElementById("regCourse").value;
    const errorTag = document.getElementById("regError");

    if(!name || !email || !password || !course) {
        errorTag.innerText = "براہ کرم تمام خانے پر کریں۔";
        errorTag.style.color = "red";
        return;
    }

    errorTag.innerText = "رجسٹریشن ہو رہی ہے، انتظار کریں...";
    errorTag.style.color = "green";

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({ action: "register", name: name, email: email, password: password, course: course })
        });
        const data = await response.json();

        if(data.status === "success") {
            alert(data.message);
            showLogin(); // کامیابی کے بعد لاگ ان سکرین پر بھیج دیں
        } else {
            errorTag.innerText = data.message;
            errorTag.style.color = "red";
        }
    } catch (err) {
        errorTag.innerText = "رابطے میں خامی: " + err.message;
        errorTag.style.color = "red";
    }
}

// 2. لاگ ان فنکشن
async function loginUser() {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const errorTag = document.getElementById("loginError");

    if(!email || !password) {
        errorTag.innerText = "براہ کرم ای میل اور پاس ورڈ دونوں درج کریں۔";
        return;
    }

    errorTag.innerText = "لاگ ان ہو رہا ہے، براہ کرم انتظار کریں...";

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({ action: "login", email: email, password: password })
        });
        const data = await response.json();

        if(data.status === "success") {
            currentStudentID = data.studentID;
            document.getElementById("loginSection").classList.add("hidden");
            document.getElementById("dashboardSection").classList.remove("hidden");
            document.getElementById("welcomeMsg").innerText = "خوش آمدید، " + data.name + " (کورس: " + data.course + ")";
        } else {
            errorTag.innerText = data.message;
        }
    } catch (err) {
        errorTag.innerText = "رابطے میں خامی: " + err.message;
    }
}

// 3. سبق حاصل کرنے کا فنکشن (ٹیکسٹ، ویڈیو، آڈیو، امیج)
async function fetchLesson() {
    const courseName = document.getElementById("courseNameInput").value;
    const dayNumber = document.getElementById("dayNumberInput").value;

    if(!courseName || !dayNumber) {
        alert("براہ کرم کورس کا نام اور دن کا نمبر درج کریں۔");
        return;
    }

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({ action: "getLesson", courseName: courseName, dayNumber: dayNumber })
        });
        const data = await response.json();

        if(data.status === "success") {
            document.getElementById("lessonCard").classList.remove("hidden");
            document.getElementById("lTitle").innerText = data.lessonTitle;
            document.getElementById("lText").innerText = data.lessonText;

            let mediaHTML = "";
            if(data.videoURL) mediaHTML += `<p><a href="${data.videoURL}" target="_blank" style="color: #007bff; font-weight: bold;">📺 ویڈیو سبق دیکھیں</a></p>`;
            if(data.audioURL) mediaHTML += `<p><strong>🎧 آڈیو سبق:</strong><br><audio controls src="${data.audioURL}" style="width:100%; margin-top:5px;"></audio></p>`;
            if(data.imageURL) mediaHTML += `<p><strong>🖼️ سبق سے متعلق تصویر:</strong><br><img src="${data.imageURL}" style="max-width:100%; border-radius:5px; margin-top:5px;"></p>`;
            
            document.getElementById("mediaArea").innerHTML = mediaHTML;

            // اسٹوڈنٹ کی پروگریس شیٹ میں خود بخود محفوظ ہو جائے گی
            saveProgressData(data.lessonID);
        } else {
            alert(data.message);
        }
    } catch (err) {
        alert("ایرر: " + err.message);
    }
}

// 4. پروگریس شیٹ میں سیو کرنے کا فنکشن
async function saveProgressData(lessonID) {
    try {
        await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({ action: "saveProgress", studentID: currentStudentID, lessonID: lessonID })
        });
    } catch (e) {
        console.log("پروگریس سیو کرنے میں مسئلہ: ", e);
    }
}

// 5. جیمنائی AI سے سوال پوچھنے کا فنکشن
async function askAI() {
    const promptText = document.getElementById("aiPrompt").value;
    const replyTag = document.getElementById("aiReply");

    if(!promptText) {
        alert("براہ کرم سوال درج کریں۔");
        return;
    }

    replyTag.innerText = "اے آئی استاد سوچ رہے ہیں، براہ کرم انتظار کریں...";

    try {
        const response = await fetch(WEB_APP_URL, {
            method: "POST",
            body: JSON.stringify({ action: "askGemini", prompt: promptText })
        });
        const data = await response.json();

        if(data.status === "success") {
            replyTag.innerText = "استاد کا جواب: " + data.reply;
        } else {
            replyTag.innerText = "جواب حاصل کرنے میں مسئلہ ہوا۔";
        }
    } catch (err) {
        replyTag.innerText = "ایرر: " + err.message;
    }
}
