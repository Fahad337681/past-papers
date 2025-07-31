// Admin Panel JavaScript

// DOM elements
const uploadForm = document.getElementById("uploadForm");
const papersTableBody = document.getElementById("papersTableBody");
const tableLoading = document.getElementById("tableLoading");
const tableNoPapers = document.getElementById("tableNoPapers");
const refreshBtn = document.getElementById("refreshBtn");
const exportBtn = document.getElementById("exportBtn");
const logoutBtn = document.getElementById("logoutBtn");
const uploadModal = document.getElementById("uploadModal");
const progressFill = document.getElementById("progressFill");
const uploadStatus = document.getElementById("uploadStatus");
const deleteModal = document.getElementById("deleteModal");
const cancelDelete = document.getElementById("cancelDelete");
const confirmDelete = document.getElementById("confirmDelete");

// Global variables
let papers = [];
let paperToDelete = null;

// Initialize admin panel
document.addEventListener("DOMContentLoaded", function () {
  loadPapers();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Upload form
  uploadForm.addEventListener("submit", handleUpload);

  // Refresh button
  refreshBtn.addEventListener("click", loadPapers);

  // Export button
  exportBtn.addEventListener("click", exportData);

  // Logout button
  logoutBtn.addEventListener("click", handleLogout);

  // Delete modal
  cancelDelete.addEventListener("click", closeDeleteModal);
  confirmDelete.addEventListener("click", confirmDeletePaper);

  // File upload drag and drop
  setupDragAndDrop();
}

// Setup drag and drop for file upload
function setupDragAndDrop() {
  const fileUpload = document.querySelector(".file-upload");
  const fileInput = document.getElementById("paper");

  ["dragenter", "dragover", "dragleave", "drop"].forEach((eventName) => {
    fileUpload.addEventListener(eventName, preventDefaults, false);
  });

  function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
  }

  ["dragenter", "dragover"].forEach((eventName) => {
    fileUpload.addEventListener(eventName, highlight, false);
  });

  ["dragleave", "drop"].forEach((eventName) => {
    fileUpload.addEventListener(eventName, unhighlight, false);
  });

  function highlight(e) {
    fileUpload.classList.add("drag-over");
  }

  function unhighlight(e) {
    fileUpload.classList.remove("drag-over");
  }

  fileUpload.addEventListener("drop", handleDrop, false);

  function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;

    if (files.length > 0) {
      fileInput.files = files;
      updateFileLabel(files[0]);
    }
  }

  // Update label when file is selected
  fileInput.addEventListener("change", function () {
    if (this.files.length > 0) {
      updateFileLabel(this.files[0]);
    }
  });
}

// Update file upload label
function updateFileLabel(file) {
  const label = document.querySelector(".file-upload-label span");
  label.textContent = file.name;

  // Update small text with file size
  const small = document.querySelector(".file-upload-label small");
  small.textContent = `Size: ${formatFileSize(file.size)}`;
}

// Handle file upload
async function handleUpload(e) {
  e.preventDefault();

  const formData = new FormData(uploadForm);
  const file = formData.get("paper");

  if (!file || file.size === 0) {
    showMessage("Please select a file to upload.", "error");
    return;
  }

  // Validate file size (10MB limit)
  if (file.size > 10 * 1024 * 1024) {
    showMessage("File size must be less than 10MB.", "error");
    return;
  }

  // Show upload modal
  showUploadModal();

  try {
    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const result = await response.json();

    if (result.success) {
      showMessage("Paper uploaded successfully!", "success");
      uploadForm.reset();
      resetFileLabel();
      loadPapers(); // Refresh the papers list
    } else {
      showMessage(result.error || "Upload failed.", "error");
    }
  } catch (error) {
    console.error("Upload error:", error);
    showMessage("Upload failed. Please try again.", "error");
  } finally {
    closeUploadModal();
  }
}

// Show upload modal with progress
function showUploadModal() {
  uploadModal.style.display = "flex";
  progressFill.style.width = "0%";
  uploadStatus.textContent = "Preparing upload...";

  // Simulate progress
  let progress = 0;
  const interval = setInterval(() => {
    progress += Math.random() * 30;
    if (progress > 90) progress = 90;

    progressFill.style.width = progress + "%";
    uploadStatus.textContent = `Uploading... ${Math.round(progress)}%`;
  }, 200);

  // Store interval for cleanup
  uploadModal.dataset.interval = interval;
}

// Close upload modal
function closeUploadModal() {
  const interval = uploadModal.dataset.interval;
  if (interval) {
    clearInterval(parseInt(interval));
  }

  uploadModal.style.display = "none";
  progressFill.style.width = "100%";
  uploadStatus.textContent = "Upload complete!";
}

// Reset file upload label
function resetFileLabel() {
  const label = document.querySelector(".file-upload-label span");
  const small = document.querySelector(".file-upload-label small");

  label.textContent = "Choose file or drag here";
  small.textContent =
    "Supported formats: PDF, DOC, DOCX, JPG, JPEG, PNG (Max: 10MB)";
}

// Load papers for admin table
async function loadPapers() {
  try {
    showTableLoading(true);
    const response = await fetch("/api/papers");
    papers = await response.json();

    displayPapersTable();
    showTableLoading(false);
  } catch (error) {
    console.error("Error loading papers:", error);
    showMessage("Failed to load papers.", "error");
    showTableLoading(false);
  }
}

// Display papers in table
function displayPapersTable() {
  if (papers.length === 0) {
    papersTableBody.innerHTML = "";
    tableNoPapers.style.display = "block";
    return;
  }

  tableNoPapers.style.display = "none";

  const tableHTML = papers.map((paper) => createTableRow(paper)).join("");
  papersTableBody.innerHTML = tableHTML;
}

// Create table row HTML
function createTableRow(paper) {
  const uploadDate = new Date(paper.uploadDate).toLocaleDateString();
  const fileIcon = getFileIcon(paper.originalName);
  const downloadCount = getDownloadCount(paper.id);

  return `
        <tr>
            <td>
                <div class="file-info">
                    <span class="file-icon ${fileIcon.class}">${
    fileIcon.icon
  }</span>
                    ${paper.subject}
                </div>
            </td>
            <td>${paper.year}</td>
            <td>${paper.examType}</td>
            <td>
                <div class="file-name">
                    <span title="${paper.originalName}">${truncateFileName(
    paper.originalName
  )}</span>
                    <small>${formatFileSize(paper.fileSize)}</small>
                </div>
            </td>
            <td>${uploadDate}</td>
            <td>
                <div class="download-count">
                    <i class="fas fa-download"></i>
                    <span>${downloadCount}</span>
                </div>
            </td>
            <td>
                <div class="table-actions">
                    <a href="${
                      paper.filePath
                    }" class="btn btn-sm btn-primary" target="_blank" download title="Download">
                        <i class="fas fa-download"></i>
                    </a>
                    <a href="${
                      paper.filePath
                    }" class="btn btn-sm btn-secondary" target="_blank" title="View">
                        <i class="fas fa-eye"></i>
                    </a>
                    <button class="btn btn-sm btn-danger" onclick="deletePaper('${
                      paper.id
                    }')" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `;
}

// Get file icon
function getFileIcon(filename) {
  const extension = filename.split(".").pop().toLowerCase();

  switch (extension) {
    case "pdf":
      return { icon: '<i class="fas fa-file-pdf"></i>', class: "pdf" };
    case "doc":
    case "docx":
      return { icon: '<i class="fas fa-file-word"></i>', class: "doc" };
    case "jpg":
    case "jpeg":
    case "png":
      return { icon: '<i class="fas fa-file-image"></i>', class: "image" };
    default:
      return { icon: '<i class="fas fa-file"></i>', class: "default" };
  }
}

// Truncate file name for display
function truncateFileName(filename, maxLength = 30) {
  if (filename.length <= maxLength) return filename;

  const extension = filename.split(".").pop();
  const name = filename.substring(0, filename.lastIndexOf("."));
  const truncatedName =
    name.substring(0, maxLength - extension.length - 4) + "...";

  return truncatedName + "." + extension;
}

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Delete paper
function deletePaper(paperId) {
  paperToDelete = paperId;
  showDeleteModal();
}

// Show delete confirmation modal
function showDeleteModal() {
  deleteModal.style.display = "flex";
}

// Close delete modal
function closeDeleteModal() {
  deleteModal.style.display = "none";
  paperToDelete = null;
}

// Confirm delete paper
async function confirmDeletePaper() {
  if (!paperToDelete) return;

  try {
    const response = await fetch(`/api/papers/${paperToDelete}`, {
      method: "DELETE",
    });

    const result = await response.json();

    if (result.success) {
      showMessage("Paper deleted successfully!", "success");
      loadPapers(); // Refresh the table
    } else {
      showMessage(result.error || "Delete failed.", "error");
    }
  } catch (error) {
    console.error("Delete error:", error);
    showMessage("Delete failed. Please try again.", "error");
  } finally {
    closeDeleteModal();
  }
}

// Show/hide table loading
function showTableLoading(show) {
  if (show) {
    tableLoading.style.display = "block";
    papersTableBody.style.display = "none";
    tableNoPapers.style.display = "none";
  } else {
    tableLoading.style.display = "none";
    papersTableBody.style.display = "table-row-group";
  }
}

// Show message
function showMessage(message, type = "info") {
  // Remove existing messages
  const existingMessages = document.querySelectorAll(".message");
  existingMessages.forEach((msg) => msg.remove());

  // Create new message
  const messageDiv = document.createElement("div");
  messageDiv.className = `message ${type}`;

  const icon =
    type === "success"
      ? "check-circle"
      : type === "error"
      ? "exclamation-triangle"
      : "info-circle";

  messageDiv.innerHTML = `
        <i class="fas fa-${icon}"></i>
        <span>${message}</span>
    `;

  // Insert at the top of the admin main
  const adminMain = document.querySelector(".admin-main .container");
  adminMain.insertBefore(messageDiv, adminMain.firstChild);

  // Remove after 5 seconds
  setTimeout(() => {
    messageDiv.remove();
  }, 5000);
}

// Close modals when clicking outside
window.addEventListener("click", function (e) {
  if (e.target === uploadModal) {
    closeUploadModal();
  }
  if (e.target === deleteModal) {
    closeDeleteModal();
  }
});

// Keyboard shortcuts
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape") {
    closeUploadModal();
    closeDeleteModal();
  }
});

// Enhanced Features

// Get download count for a paper
function getDownloadCount(paperId) {
  const savedCounts = localStorage.getItem("downloadCounts");
  if (savedCounts) {
    const downloadCounts = JSON.parse(savedCounts);
    return downloadCounts[paperId] || 0;
  }
  return 0;
}

// Export data functionality
function exportData() {
  const data = {
    papers: papers,
    statistics: {
      totalPapers: papers.length,
      totalSubjects: new Set(papers.map((p) => p.subject)).size,
      totalYears: new Set(papers.map((p) => p.year)).size,
      totalFileSize: papers.reduce((sum, p) => sum + p.fileSize, 0),
      downloadCounts: JSON.parse(
        localStorage.getItem("downloadCounts") || "{}"
      ),
    },
    exportDate: new Date().toISOString(),
  };

  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `papers-export-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showMessage("Data exported successfully!", "success");
}

// Enhanced analytics
function showAnalytics() {
  const totalPapers = papers.length;
  const totalSubjects = new Set(papers.map((p) => p.subject)).size;
  const totalYears = new Set(papers.map((p) => p.year)).size;
  const totalFileSize = papers.reduce((sum, p) => sum + p.fileSize, 0);
  const downloadCounts = JSON.parse(
    localStorage.getItem("downloadCounts") || "{}"
  );
  const totalDownloads = Object.values(downloadCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  const analytics = `
    <div class="analytics-summary">
      <h4>Library Analytics</h4>
      <div class="analytics-grid">
        <div class="analytics-item">
          <span class="analytics-number">${totalPapers}</span>
          <span class="analytics-label">Total Papers</span>
        </div>
        <div class="analytics-item">
          <span class="analytics-number">${totalSubjects}</span>
          <span class="analytics-label">Subjects</span>
        </div>
        <div class="analytics-item">
          <span class="analytics-number">${totalYears}</span>
          <span class="analytics-label">Years</span>
        </div>
        <div class="analytics-item">
          <span class="analytics-number">${totalDownloads}</span>
          <span class="analytics-label">Downloads</span>
        </div>
        <div class="analytics-item">
          <span class="analytics-number">${formatFileSize(totalFileSize)}</span>
          <span class="analytics-label">Total Size</span>
        </div>
      </div>
    </div>
  `;

  // Show analytics in a modal or dedicated section
  showMessage("Analytics data loaded", "info");
}

// Handle logout
async function handleLogout() {
  try {
    const response = await fetch("/logout", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (data.success) {
      // Redirect to login page
      window.location.href = "/login";
    } else {
      showMessage("Logout failed. Please try again.", "error");
    }
  } catch (error) {
    console.error("Logout error:", error);
    showMessage("Network error during logout.", "error");
  }
}
