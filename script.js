 
document.getElementById("year").textContent = new Date().getFullYear();

const students = JSON.parse(localStorage.getItem("students")) || [];

function saveToStorage() {
  localStorage.setItem("students", JSON.stringify(students));
}

function formatDate(date = new Date()) {
  return date.toISOString().split("T")[0];
}

function addStudent() {
  const nameInput = document.getElementById("studentName");
  const name = nameInput.value.trim();
  if (name === "") return;
  if (!students.find(s => s.name === name)) {
    students.push({ name, attendance: [] });
    saveToStorage();
    nameInput.value = "";
    renderTable();
  } else {
    alert("Student already exists.");
  }
}

function renderTable() {
  const table = document.getElementById("studentTable");
  table.innerHTML = "";
  const today = formatDate();

  students.forEach((student, index) => {
    if (!student.attendance) student.attendance = [];
    const todayStatus = student.attendance.find(a => a.date === today)?.status || "Absent";

    const row = document.createElement("tr");
    row.className = "hover:bg-gray-100 transition";
    row.innerHTML = `
      <td class="border p-4">${student.name}</td>
      <td class="border p-4">
        <span class="px-4 py-1 rounded-full text-white text-xs font-semibold ${todayStatus === 'Present' ? 'bg-green-500' : 'bg-red-500'}">
          ${todayStatus}
        </span>
      </td>
      <td class="border p-4 space-x-2">
        <button onclick="toggleAttendance(${index})" class="bg-yellow-400 text-white px-4 py-1 rounded button-hover">Toggle</button>
        <button onclick="deleteStudent(${index})" class="bg-red-600 text-white px-4 py-1 rounded button-hover">Delete</button>
      </td>`;
    table.appendChild(row);
  });
}

function searchStudent() {
  const query = document.getElementById("searchInput").value.toLowerCase();
  const table = document.getElementById("studentTable");
  table.innerHTML = "";
  const today = formatDate();

  students
    .filter(student => student.name.toLowerCase().includes(query))
    .forEach((student, index) => {
      const todayStatus = student.attendance.find(a => a.date === today)?.status || "Absent";

      const row = document.createElement("tr");
      row.className = "hover:bg-gray-100 transition";
      row.innerHTML = `
        <td class="border p-4">${student.name}</td>
        <td class="border p-4">
          <span class="px-4 py-1 rounded-full text-white text-xs font-semibold ${todayStatus === 'Present' ? 'bg-green-500' : 'bg-red-500'}">
            ${todayStatus}
          </span>
        </td>
        <td class="border p-4 space-x-2">
          <button onclick="toggleAttendance(${students.indexOf(student)})" class="bg-yellow-400 text-white px-4 py-1 rounded button-hover">Toggle</button>
          <button onclick="deleteStudent(${students.indexOf(student)})" class="bg-red-600 text-white px-4 py-1 rounded button-hover">Delete</button>
        </td>`;
      table.appendChild(row);
    });
}

// function addDailyAttendance() {
//   const today = document.getElementById('attendanceDate').value || formatDate();
//   students.forEach(student => {
//     if (!Array.isArray(student.attendance)) student.attendance = [];
//     const existingAttendance = student.attendance.find(att => att.date === today);
//     if (!existingAttendance) {
//       student.attendance.push({ date: today, status: 'Absent' });
//     }
//   });
//   saveToStorage();
//   renderTable();
// }

function addDailyAttendance() {
  const today = document.getElementById('attendanceDate').value || formatDate();

  students.forEach(student => {
    if (!Array.isArray(student.attendance)) student.attendance = [];

    const existingIndex = student.attendance.findIndex(att => att.date === today);
    if (existingIndex >= 0) {
      student.attendance[existingIndex].status = 'Present';
    } else {
      student.attendance.push({ date: today, status: 'Present' });
    }
  });

  saveToStorage();
  renderTable();

  alert(`Attendance marked as 'Present' for ${students.length} students on ${today}`);
}




function toggleAttendance(index) {
  const student = students[index];
  if (!student.attendance) student.attendance = [];
  const today = formatDate();
  const entry = student.attendance.find(a => a.date === today);

  if (entry) {
    entry.status = entry.status === "Present" ? "Absent" : "Present";
  } else {
    student.attendance.push({ date: today, status: "Present" });
  }
  saveToStorage();
  renderTable();
}

function deleteStudent(index) {
  if (confirm("Are you sure you want to delete this student?")) {
    students.splice(index, 1);
    saveToStorage();
    renderTable();
  }
}

function showTotalAttendance() {
  const display = document.getElementById("totalAttendanceDisplay");
  display.innerHTML = "";
  students.forEach(student => {
    const present = student.attendance.filter(a => a.status === "Present").length;
    const absent = student.attendance.filter(a => a.status === "Absent").length;
    display.innerHTML += `<p><strong>${student.name}:</strong> Present: ${present}, Absent: ${absent}</p>`;
  });
}

function shareAttendanceEmail() {
  const attendanceData = students.map(student => {
    const present = student.attendance.filter(a => a.status === "Present").length;
    const absent = student.attendance.filter(a => a.status === "Absent").length;
    return `${student.name}: Present: ${present}, Absent: ${absent}`;
  }).join("\n");
  const subject = "Attendance Data - AttendancePro";
  const body = encodeURIComponent(attendanceData);
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

function shareAttendanceWhatsApp() {
  const attendanceData = students.map(student => {
    const present = student.attendance.filter(a => a.status === "Present").length;
    const absent = student.attendance.filter(a => a.status === "Absent").length;
    return `${student.name}: Present: ${present}, Absent: ${absent}`;
  }).join("\n");
  const encodedText = encodeURIComponent(attendanceData);
  window.location.href = `https://wa.me/?text=${encodedText}`;
}

function downloadCSV() {
  let csv = "Name,Present,Absent\n";
  students.forEach(student => {
    const present = student.attendance.filter(a => a.status === "Present").length;
    const absent = student.attendance.filter(a => a.status === "Absent").length;
    csv += `${student.name},${present},${absent}\n`;
  });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
  link.download = "attendance.csv";
  link.click();
}

function downloadPDF() {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  let y = 10;
  doc.setFontSize(14);
  students.forEach(student => {
    const present = student.attendance.filter(a => a.status === "Present").length;
    const absent = student.attendance.filter(a => a.status === "Absent").length;
    doc.text(`${student.name}: Present: ${present}, Absent: ${absent}`, 10, y);
    y += 10;
  });
  doc.save("attendance.pdf");
}

function clearAllAttendance() {
  if (confirm("Are you sure you want to clear all attendance data?")) {
    students.forEach(student => student.attendance = []);
    saveToStorage();
    renderTable();
  }
}

window.addEventListener("load", renderTable);
 