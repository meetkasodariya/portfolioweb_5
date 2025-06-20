document.addEventListener("DOMContentLoaded", () => {
  // Mobile Menu Elements
  const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
  const nav = document.querySelector('nav');
  const header = document.querySelector('header');
  
  // Mobile Menu Toggle
  mobileMenuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = mobileMenuBtn.getAttribute('aria-expanded') === 'true';
    mobileMenuBtn.setAttribute('aria-expanded', !isExpanded);
    nav.classList.toggle('active');
    document.body.classList.toggle('menu-open');
  });

  // Close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (!nav.contains(e.target) && e.target !== mobileMenuBtn) {
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('active');
      document.body.classList.remove('menu-open');
    }
  });

  // Navigation and Section Handling
  document.querySelectorAll('nav a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Close mobile menu
      mobileMenuBtn.setAttribute('aria-expanded', 'false');
      nav.classList.remove('active');
      document.body.classList.remove('menu-open');
      
      // Update active nav item
      document.querySelectorAll('nav a').forEach(item => {
        item.classList.remove('active');
      });
      this.classList.add('active');
      
      const targetId = this.getAttribute('href');
      const targetSection = document.querySelector(targetId);
      
      if (targetSection) {
        // Calculate scroll position accounting for fixed header
        const headerHeight = header.offsetHeight;
        const targetPosition = targetSection.offsetTop - headerHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
        
        // Update URL
        history.pushState(null, null, targetId);
      }
    });
  });

  // Scroll-based Section Activation
  const sections = document.querySelectorAll('.section');
  const headerHeight = header.offsetHeight;
  
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        const correspondingNavLink = document.querySelector(`nav a[href="#${id}"]`);
        
        if (correspondingNavLink) {
          document.querySelectorAll('nav a').forEach(link => {
            link.classList.remove('active');
          });
          correspondingNavLink.classList.add('active');
        }
      }
    });
  }, { 
    threshold: 0.3,
    rootMargin: `-${headerHeight}px 0px 0px 0px`
  });

  // Observe all sections
  sections.forEach(section => {
    sectionObserver.observe(section);
  });

  // Back to Top Button
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    window.addEventListener('scroll', () => {
      backToTopBtn.classList.toggle('visible', window.scrollY > 300);
    });

    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }

  // Form Submission
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    const submitBtn = contactForm.querySelector('.btn-primary');
    const submitText = contactForm.querySelector('.submit-text');
    const loadingIcon = contactForm.querySelector('.loading-icon');
    const resultDiv = contactForm.querySelector('#result');

    contactForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      // Validate form
      const inputs = this.querySelectorAll('input[required], textarea[required]');
      let isValid = true;
      
      inputs.forEach(input => {
        if (!input.value.trim()) {
          input.style.borderColor = 'var(--error-color)';
          isValid = false;
        } else {
          input.style.borderColor = '#ddd';
        }
      });
      
      if (!isValid) {
        showFormMessage('Please fill all required fields', 'error');
        return;
      }
      
      // Show loading state
      submitText.style.display = 'none';
      loadingIcon.style.display = 'inline-block';
      submitBtn.disabled = true;
      
      try {
        const formData = new FormData(this);
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
          showFormMessage('Thank you! Your message has been sent.', 'success');
          contactForm.reset();
        } else {
          throw new Error(data.message || 'Failed to send message');
        }
      } catch (error) {
        showFormMessage(error.message || 'Error sending message. Please try again.', 'error');
      } finally {
        submitText.style.display = 'inline-block';
        loadingIcon.style.display = 'none';
        submitBtn.disabled = false;
      }
      
      function showFormMessage(message, type) {
        resultDiv.textContent = message;
        resultDiv.className = `form-message ${type}`;
        resultDiv.style.display = 'block';
        
        setTimeout(() => {
          resultDiv.style.display = 'none';
        }, 5000);
      }
    });
  }

  // Skills Animation
  const skillsSection = document.querySelector('.skills-section');
  const progressBars = document.querySelectorAll('.progress');

  if (skillsSection && progressBars.length) {
    const skillsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          skillsSection.classList.add('in-view');
          progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.setProperty('--target-width', width);
            bar.style.width = '0';
            setTimeout(() => {
              bar.style.width = width;
            }, 100);
          });
        }
      });
    }, { threshold: 0.1 });

    skillsObserver.observe(skillsSection);
  }

  // Initialize animations with delays
  const animateElements = (selector, delayIncrement = 0.1) => {
    const elements = document.querySelectorAll(selector);
    elements.forEach((el, index) => {
      el.style.animationDelay = `${index * delayIncrement}s`;
    });
  };

  animateElements(".fade-in");
  animateElements(".slide-in-left");
  animateElements(".slide-in-right");
  animateElements(".scale-in", 0.15);

  // Set home as active by default
  const homeLink = document.querySelector('nav a[href="#home"]');
  const homeSection = document.getElementById('home');
  
  if (homeLink) homeLink.classList.add('active');
  if (homeSection) homeSection.classList.add('active');

  // Button actions
  document.querySelector('.hire')?.addEventListener('click', () => {
    document.querySelector('nav a[href="#contact"]')?.click();
  });
  
  document.querySelector('.cv')?.addEventListener('click', () => {
    console.log('Downloading CV...');
    // window.open('your-cv.pdf', '_blank');
  });

  // Lazy load images
  const lazyLoadImages = () => {
    const lazyImages = document.querySelectorAll('img[loading="lazy"]');
    
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            imageObserver.unobserve(img);
          }
        });
      }, { rootMargin: '200px' });
      
      lazyImages.forEach(img => {
        if (img.dataset.src) {
          imageObserver.observe(img);
        }
      });
    }
  };

  lazyLoadImages();

  // Handle browser back/forward navigation
  window.addEventListener('popstate', () => {
    const hash = window.location.hash;
    if (hash) {
      const link = document.querySelector(`nav a[href="${hash}"]`);
      if (link) link.click();
    } else if (homeLink) {
      homeLink.click();
    }
  });
});
const downloadResume = document.getElementById('download-resume');
    if (downloadResume) {
        downloadResume.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Change button text temporarily
            const originalText = this.innerHTML;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Downloading...';
            
            setTimeout(() => {
                const link = document.createElement('a');
                link.href = 'resume/meet_cv2.pdf';
                link.download = 'Meet_Patel_Resume.pdf'; // Custom filename for download
                link.target = '_blank'; // Open in new tab if download fails
                link.style.display = 'none'; // Hide the link element
                
                // Important: Add these attributes to force download
                link.setAttribute('download', '');
                link.setAttribute('type', 'application/pdf');
                
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                
                // Restore button text
                this.innerHTML = originalText;
                
                // Show download notification
                showDownloadNotification();
            }, 500);
        });
    }
    
    function showDownloadNotification() {
        const notification = document.createElement('div');
        notification.className = 'download-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>Resume downloaded successfully!</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 500);
        }, 2500);
    }
    document.addEventListener('DOMContentLoaded', function() {
        const contactForm = document.querySelector('.contact-form');
        const resultDiv = document.getElementById('result');
        const submitBtn = contactForm.querySelector('button[type="submit"]');
    
        if (contactForm) {
            contactForm.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Show loading state
                submitBtn.classList.add('is-loading');
                submitBtn.disabled = true;
                
                // Get form data
                const formData = new FormData(contactForm);
                
                // Send to Web3Forms
                fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        resultDiv.textContent = "Message sent successfully! We'll get back to you soon.";
                        resultDiv.className = 'form-message success';
                        contactForm.reset();
                    } else {
                        resultDiv.textContent = "Error sending message. Please try again later.";
                        resultDiv.className = 'form-message error';
                    }
                })
                .catch(error => {
                    resultDiv.textContent = "Network error. Please check your connection and try again.";
                    resultDiv.className = 'form-message error';
                })
                .finally(() => {
                    submitBtn.classList.remove('is-loading');
                    submitBtn.disabled = false;
                    resultDiv.style.display = 'block';
                    
                    // Hide message after 5 seconds
                    setTimeout(() => {
                        resultDiv.style.display = 'none';
                    }, 5000);
                });
            });
        }
    });
    document.addEventListener("DOMContentLoaded", () => {
      // Populate About Section
      document.getElementById('job-title').textContent = `${personalDetails.jobTitle} & UI/UX Designer`;
      
      const aboutDescription = document.getElementById('about-description');
      personalDetails.description.forEach(paragraph => {
        const p = document.createElement('p');
        p.className = 'about-text';
        p.textContent = paragraph;
        aboutDescription.appendChild(p);
      });
      
      const personalInfo = document.getElementById('personal-info');
      personalInfo.innerHTML = `
        <div class="info-item">
          <span class="info-label">Name:</span>
          <span class="info-value">${personalDetails.name}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email:</span>
          <span class="info-value">${personalDetails.email}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Experience:</span>
          <span class="info-value">${personalDetails.experience}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Location:</span>
          <span class="info-value">${personalDetails.location}</span>
        </div>
      `;
      
      // Populate Skills Section
      const skillsContainer = document.getElementById('skills-container');
      skills.forEach(skill => {
        const skillItem = document.createElement('div');
        skillItem.className = 'skill-item';
        skillItem.innerHTML = `
          <div class="skill-info">
            <span>${skill.name}</span>
            <span>${skill.percentage}</span>
          </div>
          <div class="progress-bar">
            <div class="progress" style="width: ${skill.percentage}"></div>
          </div>
        `;
        skillsContainer.appendChild(skillItem);
      });
      
      // Populate Portfolio Section
      const portfolioContainer = document.getElementById('portfolio-container');
      portfolioItems.forEach(item => {
        const portfolioItem = document.createElement('div');
        portfolioItem.className = 'portfolio-item scale-in';
        portfolioItem.innerHTML = `
          <img src="${item.image}" alt="${item.title}" loading="lazy">
          <div class="portfolio-overlay">
            <h3>${item.title}</h3>
            <p>${item.technologies}</p>
            <a href="#" class="view-btn">View Project</a>
          </div>
        `;
        portfolioContainer.appendChild(portfolioItem);
      });
      
      // Populate Blog Section
      const blogContainer = document.getElementById('blog-container');
      blogPosts.forEach(post => {
        const blogCard = document.createElement('div');
        blogCard.className = 'blog-card fade-in';
        blogCard.innerHTML = `
          <img src="${post.image}" alt="${post.title}" loading="lazy">
          <div class="blog-content">
            <span class="blog-date">${post.date}</span>
            <h3>${post.title}</h3>
            <p>${post.description}</p>
            <a href="#" class="read-more">Read More</a>
          </div>
        `;
        blogContainer.appendChild(blogCard);
      });
      
      // Update contact info
      document.querySelectorAll('.contact-info .info-item:nth-child(1) span').forEach(el => {
        el.textContent = personalDetails.email;
      });
      document.querySelectorAll('.contact-info .info-item:nth-child(2) span').forEach(el => {
        el.textContent = personalDetails.phone;
      });
      
      // Update footer year
      document.querySelector('footer p').textContent = `© ${new Date().getFullYear()} ${personalDetails.name}. All Rights Reserved.`;
      
      // Rest of your existing JavaScript code (navigation, animations, etc.)
      // ...
    });