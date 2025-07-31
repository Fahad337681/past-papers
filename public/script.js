// Global variables
let allPapers = [];
let filteredPapers = [];
let downloadCounts = {};

// DOM elements
const papersGrid = document.getElementById("papersGrid");
const loading = document.getElementById("loading");
const noPapers = document.getElementById("noPapers");
const searchInput = document.getElementById("searchInput");
const searchBtn = document.getElementById("searchBtn");
const subjectFilter = document.getElementById("subjectFilter");
const yearFilter = document.getElementById("yearFilter");
const examTypeFilter = document.getElementById("examTypeFilter");

// New DOM elements for enhanced features
const totalPapersEl = document.getElementById("totalPapers");
const totalSubjectsEl = document.getElementById("totalSubjects");
const totalYearsEl = document.getElementById("totalYears");
const totalDownloadsEl = document.getElementById("totalDownloads");
const recentPapersBtn = document.getElementById("recentPapers");
const popularPapersBtn = document.getElementById("popularPapers");
const newestPapersBtn = document.getElementById("newestPapers");
const downloadAllBtn = document.getElementById("downloadAll");
const advancedSearch = document.getElementById("advancedSearch");
const advancedSearchBtn = document.getElementById("advancedSearchBtn");

// Initialize the application
document.addEventListener("DOMContentLoaded", function () {
  loadPapers();
  setupEventListeners();
});

// Setup event listeners
function setupEventListeners() {
  // Search functionality
  searchBtn.addEventListener("click", performSearch);
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      performSearch();
    }
  });

  // Filter functionality
  subjectFilter.addEventListener("change", applyFilters);
  yearFilter.addEventListener("change", applyFilters);
  examTypeFilter.addEventListener("change", applyFilters);

  // Enhanced features
  recentPapersBtn.addEventListener("click", showRecentPapers);
  popularPapersBtn.addEventListener("click", showPopularPapers);
  newestPapersBtn.addEventListener("click", showNewestPapers);
  downloadAllBtn.addEventListener("click", downloadAllPapers);
  advancedSearchBtn.addEventListener("click", performAdvancedSearch);

  // Toggle advanced search
  searchInput.addEventListener("focus", () => {
    if (searchInput.value.length > 0) {
      advancedSearch.style.display = "block";
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    if (e.ctrlKey && e.key === "k") {
      e.preventDefault();
      searchInput.focus();
    }
    if (e.ctrlKey && e.key === "a") {
      e.preventDefault();
      downloadAllPapers();
    }
  });
}

// Load papers from API
async function loadPapers() {
  try {
    showLoading(true);
    const response = await fetch("/api/papers");
    const papers = await response.json();

    allPapers = papers;
    filteredPapers = papers;

    // Load download counts from localStorage
    const savedCounts = localStorage.getItem("downloadCounts");
    if (savedCounts) {
      downloadCounts = JSON.parse(savedCounts);
    }

    populateFilters();
    displayPapers();
    updateStats();
    showLoading(false);
  } catch (error) {
    console.error("Error loading papers:", error);
    showError("Failed to load papers. Please try again.");
    showLoading(false);
  }
}

// Populate filter dropdowns
function populateFilters() {
  const subjects = [...new Set(allPapers.map((paper) => paper.subject))].sort();
  const years = [...new Set(allPapers.map((paper) => paper.year))].sort(
    (a, b) => b - a
  );
  const examTypes = [
    ...new Set(allPapers.map((paper) => paper.examType)),
  ].sort();

  // Populate subject filter
  subjects.forEach((subject) => {
    const option = document.createElement("option");
    option.value = subject;
    option.textContent = subject;
    subjectFilter.appendChild(option);
  });

  // Populate year filter
  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });

  // Populate exam type filter
  examTypes.forEach((examType) => {
    const option = document.createElement("option");
    option.value = examType;
    option.textContent = examType;
    examTypeFilter.appendChild(option);
  });
}

// Display papers in the grid
function displayPapers() {
  if (filteredPapers.length === 0) {
    papersGrid.innerHTML = "";
    noPapers.style.display = "block";
    return;
  }

  noPapers.style.display = "none";

  const papersHTML = filteredPapers
    .map((paper) => createPaperCard(paper))
    .join("");
  papersGrid.innerHTML = papersHTML;
}

// Create paper card HTML
function createPaperCard(paper) {
  const fileIcon = getFileIcon(paper.originalName);
  const fileSize = formatFileSize(paper.fileSize);
  const uploadDate = new Date(paper.uploadDate).toLocaleDateString();

  return `
        <div class="paper-card">
            <div class="paper-header">
                <div>
                    <div class="paper-title">${paper.subject}</div>
                    <div class="paper-meta">
                        <span class="meta-item">${paper.year}</span>
                        <span class="meta-item">${paper.examType}</span>
                    </div>
                </div>
                <div class="file-icon ${fileIcon.class}">${fileIcon.icon}</div>
            </div>
            <div class="paper-info">
                <p><strong>File:</strong> ${paper.originalName}</p>
                <p><strong>Size:</strong> ${fileSize}</p>
                <p><strong>Uploaded:</strong> ${uploadDate}</p>
            </div>
            <div class="paper-actions">
                <a href="${paper.filePath}" class="btn btn-primary" target="_blank" download>
                    <i class="fas fa-download"></i>
                    Download
                </a>
                <a href="${paper.filePath}" class="btn btn-secondary" target="_blank">
                    <i class="fas fa-eye"></i>
                    View
                </a>
            </div>
        </div>
    `;
}

// Get file icon based on file extension
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

// Format file size
function formatFileSize(bytes) {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
}

// Perform search
function performSearch() {
  const searchTerm = searchInput.value.toLowerCase().trim();

  if (searchTerm === "") {
    filteredPapers = allPapers;
  } else {
    filteredPapers = allPapers.filter(
      (paper) =>
        paper.subject.toLowerCase().includes(searchTerm) ||
        paper.year.toString().includes(searchTerm) ||
        paper.examType.toLowerCase().includes(searchTerm) ||
        paper.originalName.toLowerCase().includes(searchTerm)
    );
  }

  displayPapers();
}

// Apply filters
function applyFilters() {
  const subjectValue = subjectFilter.value;
  const yearValue = yearFilter.value;
  const examTypeValue = examTypeFilter.value;

  filteredPapers = allPapers.filter((paper) => {
    const subjectMatch = !subjectValue || paper.subject === subjectValue;
    const yearMatch = !yearValue || paper.year.toString() === yearValue;
    const examTypeMatch = !examTypeValue || paper.examType === examTypeValue;

    return subjectMatch && yearMatch && examTypeMatch;
  });

  displayPapers();
}

// Show/hide loading state
function showLoading(show) {
  if (show) {
    loading.style.display = "block";
    papersGrid.style.display = "none";
    noPapers.style.display = "none";
  } else {
    loading.style.display = "none";
    papersGrid.style.display = "grid";
  }
}

// Show error message
function showError(message) {
  // Create error message element
  const errorDiv = document.createElement("div");
  errorDiv.className = "message error";
  errorDiv.innerHTML = `
        <i class="fas fa-exclamation-triangle"></i>
        <span>${message}</span>
    `;

  // Insert at the top of papers section
  const papersSection = document.querySelector(".papers-section .container");
  papersSection.insertBefore(errorDiv, papersSection.firstChild);

  // Remove after 5 seconds
  setTimeout(() => {
    errorDiv.remove();
  }, 5000);
}

// Show success message
function showSuccess(message) {
  const successDiv = document.createElement("div");
  successDiv.className = "message success";
  successDiv.innerHTML = `
        <i class="fas fa-check-circle"></i>
        <span>${message}</span>
    `;

  const papersSection = document.querySelector(".papers-section .container");
  papersSection.insertBefore(successDiv, papersSection.firstChild);

  setTimeout(() => {
    successDiv.remove();
  }, 5000);
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.querySelector(this.getAttribute("href"));
    if (target) {
      target.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  });
});

// Active navigation highlighting
window.addEventListener("scroll", function () {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".nav-link");

  let current = "";
  sections.forEach((section) => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.clientHeight;
    if (scrollY >= sectionTop - 200) {
      current = section.getAttribute("id");
    }
  });

  navLinks.forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("href") === `#${current}`) {
      link.classList.add("active");
    }
  });
});

// Enhanced Features Functions

// Update statistics
function updateStats() {
  const totalPapers = allPapers.length;
  const totalSubjects = new Set(allPapers.map((p) => p.subject)).size;
  const totalYears = new Set(allPapers.map((p) => p.year)).size;
  const totalDownloads = Object.values(downloadCounts).reduce(
    (sum, count) => sum + count,
    0
  );

  totalPapersEl.textContent = totalPapers;
  totalSubjectsEl.textContent = totalSubjects;
  totalYearsEl.textContent = totalYears;
  totalDownloadsEl.textContent = totalDownloads;
}

// Show recent papers (last 7 days)
function showRecentPapers() {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  filteredPapers = allPapers.filter(
    (paper) => new Date(paper.uploadDate) >= sevenDaysAgo
  );

  displayPapers();
  showNotification("Showing recent papers (last 7 days)", "info");
}

// Show popular papers (most downloaded)
function showPopularPapers() {
  filteredPapers = allPapers
    .sort((a, b) => {
      const aDownloads = downloadCounts[a.id] || 0;
      const bDownloads = downloadCounts[b.id] || 0;
      return bDownloads - aDownloads;
    })
    .slice(0, 10);

  displayPapers();
  showNotification("Showing most popular papers", "info");
}

// Show newest papers
function showNewestPapers() {
  filteredPapers = allPapers.sort(
    (a, b) => new Date(b.uploadDate) - new Date(a.uploadDate)
  );

  displayPapers();
  showNotification("Showing newest papers first", "info");
}

// Download all papers
async function downloadAllPapers() {
  if (filteredPapers.length === 0) {
    showNotification("No papers to download", "error");
    return;
  }

  showNotification(
    `Starting download of ${filteredPapers.length} papers...`,
    "info"
  );

  for (let i = 0; i < filteredPapers.length; i++) {
    const paper = filteredPapers[i];
    const link = document.createElement("a");
    link.href = paper.filePath;
    link.download = paper.originalName;
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Update download count
    downloadCounts[paper.id] = (downloadCounts[paper.id] || 0) + 1;
    localStorage.setItem("downloadCounts", JSON.stringify(downloadCounts));

    // Small delay to prevent browser blocking
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  updateStats();
  showNotification(
    `Successfully downloaded ${filteredPapers.length} papers!`,
    "success"
  );
}

// Perform advanced search
function performAdvancedSearch() {
  const subject = document
    .getElementById("advancedSubject")
    .value.toLowerCase();
  const yearRange = document.getElementById("advancedYear").value;
  const examType = document.getElementById("advancedExamType").value;
  const fileType = document.getElementById("advancedFileType").value;

  filteredPapers = allPapers.filter((paper) => {
    const subjectMatch =
      !subject || paper.subject.toLowerCase().includes(subject);
    const examTypeMatch = !examType || paper.examType === examType;
    const fileTypeMatch =
      !fileType || getFileExtension(paper.originalName) === fileType;

    let yearMatch = true;
    if (yearRange) {
      const [startYear, endYear] = yearRange.split("-").map(Number);
      yearMatch = paper.year >= startYear && paper.year <= endYear;
    }

    return subjectMatch && yearMatch && examTypeMatch && fileTypeMatch;
  });

  displayPapers();
  showNotification(
    `Found ${filteredPapers.length} papers matching criteria`,
    "success"
  );
}

// Get file extension
function getFileExtension(filename) {
  const ext = filename.split(".").pop().toLowerCase();
  if (["jpg", "jpeg", "png"].includes(ext)) return "image";
  return ext;
}

// Enhanced notification system
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <i class="fas fa-${
      type === "success"
        ? "check-circle"
        : type === "error"
        ? "exclamation-triangle"
        : "info-circle"
    }"></i>
    <span>${message}</span>
  `;

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => notification.classList.add("show"), 100);

  // Remove notification
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => notification.remove(), 300);
  }, 4000);
}

// Enhanced paper card with download tracking
function createPaperCard(paper) {
  const fileIcon = getFileIcon(paper.originalName);
  const fileSize = formatFileSize(paper.fileSize);
  const uploadDate = new Date(paper.uploadDate).toLocaleDateString();
  const downloadCount = downloadCounts[paper.id] || 0;

  return `
    <div class="paper-card">
      <div class="paper-header">
        <div>
          <div class="paper-title">${paper.subject}</div>
          <div class="paper-meta">
            <span class="meta-item">${paper.year}</span>
            <span class="meta-item">${paper.examType}</span>
            <span class="meta-item">${downloadCount} downloads</span>
          </div>
        </div>
        <div class="file-icon ${fileIcon.class}">${fileIcon.icon}</div>
      </div>
      <div class="paper-info">
        <p><strong>File:</strong> ${paper.originalName}</p>
        <p><strong>Size:</strong> ${fileSize}</p>
        <p><strong>Uploaded:</strong> ${uploadDate}</p>
      </div>
      <div class="paper-actions">
        <a href="${paper.filePath}" class="btn btn-primary" target="_blank" download onclick="trackDownload('${paper.id}')">
          <i class="fas fa-download"></i>
          Download
        </a>
        <a href="${paper.filePath}" class="btn btn-secondary" target="_blank">
          <i class="fas fa-eye"></i>
          View
        </a>
      </div>
    </div>
  `;
}

// Track download
function trackDownload(paperId) {
  downloadCounts[paperId] = (downloadCounts[paperId] || 0) + 1;
  localStorage.setItem("downloadCounts", JSON.stringify(downloadCounts));
  updateStats();
}

// Export functions for global access
window.trackDownload = trackDownload;
