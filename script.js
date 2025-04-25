// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyAwGmVEAJO49iLkfASobN4aqhXBqSP-BBs",
  authDomain: "classschedulerapp-af122.firebaseapp.com",
  databaseURL: "https://classschedulerapp-af122-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "classschedulerapp-af122",
  storageBucket: "classschedulerapp-af122.firebasestorage.app",
  messagingSenderId: "781740188469",
  appId: "1:781740188469:web:92379d80d3b78a2c80227c"
};

firebase.initializeApp(firebaseConfig);

const db = firebase.database();
const auth = firebase.auth();

let isTeacher = false;

function login() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      alert("Logged in!");
    })
    .catch(err => alert(err.message));
}

function logout() {
  auth.signOut().then(() => {
    alert("Logged out");
  });
}

auth.onAuthStateChanged(user => {
  const logoutBtn = document.getElementById("logoutBtn");
  isTeacher = user && user.email === "teacher@email.com";
  if (isTeacher) logoutBtn.style.display = "inline-block";
  else logoutBtn.style.display = "none";

  loadSchedule();
});

function loadSchedule() {
  const container = document.getElementById("schedule");
  container.innerHTML = "";
  db.ref("schedule").once("value", snapshot => {
    const data = snapshot.val();
    for (let day in data) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "day";
      dayDiv.innerHTML = `<h3>${day}</h3>`;
      data[day].forEach((cls, index) => {
        const div = document.createElement("div");
        div.className = "class-item";
        div.innerHTML = `${cls.time} - ${cls.subject} in ${cls.room}`;
        if (cls.exam) {
          div.innerHTML += `<br><strong>📝 Exam:</strong> ${cls.exam}`;
        }
        if (isTeacher) {
          const btn = document.createElement("button");
          btn.className = "edit-btn";
          btn.textContent = "Edit";
          btn.onclick = () => {
            const newExam = prompt("Enter exam topic:", cls.exam || "");
            if (newExam !== null) {
              db.ref(`schedule/${day}/${index}/exam`).set(newExam);
              loadSchedule();
            }
          };
          div.appendChild(btn);
        }
        dayDiv.appendChild(div);
      });
      container.appendChild(dayDiv);
    }
  });
}
