// Navigation
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const targetPage = item.dataset.page;
        
        // Update active nav item
        document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        // Show target page
        document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
        document.getElementById(targetPage).classList.add('active');
    });
});

// Charts
const setupCharts = () => {
    Chart.defaults.color = '#2C1810';
    Chart.defaults.borderColor = '#D7CCC8';
    
    // Sales Trend Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
            datasets: [{
                label: 'Sales (₹)',
                data: [65000, 59000, 80000, 81000, 56000, 95000],
                borderColor: '#8B4513',
                backgroundColor: 'rgba(139, 69, 19, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: {
                            family: 'Inter',
                            weight: '500'
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(139, 69, 19, 0.9)',
                    titleFont: {
                        family: 'Inter',
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(215, 204, 200, 0.3)'
                    },
                    ticks: {
                        font: {
                            family: 'Inter'
                        }
                    }
                },
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        font: {
                            family: 'Inter'
                        }
                    }
                }
            }
        }
    });

    // Top Products Chart
    const productsCtx = document.getElementById('productsChart').getContext('2d');
    new Chart(productsCtx, {
        type: 'doughnut',
        data: {
            labels: ['W180', 'W210', 'W240', 'W320', 'W450'],
            datasets: [{
                data: [30, 25, 20, 15, 10],
                backgroundColor: [
                    '#8B4513',
                    '#A0522D',
                    '#D2691E',
                    '#DEB887',
                    '#F5DEB3'
                ],
                borderWidth: 2,
                borderColor: '#FFFFFF'
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        font: {
                            family: 'Inter',
                            size: 13,
                            weight: '500'
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(139, 69, 19, 0.9)',
                    titleFont: {
                        family: 'Inter',
                        size: 14,
                        weight: '600'
                    },
                    bodyFont: {
                        family: 'Inter',
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8
                }
            },
            cutout: '65%'
        }
    });
};

// SQL Query Executor
document.getElementById('executeQuery')?.addEventListener('click', async () => {
    const query = document.getElementById('sqlQuery').value;
    const outputDiv = document.getElementById('queryOutput');
    const button = document.getElementById('executeQuery');
    
    try {
        button.disabled = true;
        button.textContent = 'Executing...';
        
        // Replace with actual API call
        const response = await fetch('/api/execute', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ query })
        });
        
        const data = await response.json();
        
        // Display results in a table
        if (data.results) {
            const table = document.createElement('table');
            table.innerHTML = `
                <thead>
                    <tr>${Object.keys(data.results[0]).map(key => `<th>${key}</th>`).join('')}</tr>
                </thead>
                <tbody>
                    ${data.results.map(row => `
                        <tr>${Object.values(row).map(value => `<td>${value}</td>`).join('')}</tr>
                    `).join('')}
                </tbody>
            `;
            outputDiv.innerHTML = '';
            outputDiv.appendChild(table);
        }
    } catch (error) {
        outputDiv.innerHTML = `<div class="error">Error executing query: ${error.message}</div>`;
    } finally {
        button.disabled = false;
        button.textContent = 'Execute Query';
    }
});

// Initialize charts when the page loads
document.addEventListener('DOMContentLoaded', () => {
    setupCharts();
});

// Add smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// Add loading state for interactive elements
document.querySelectorAll('button, input[type="submit"]').forEach(button => {
    button.addEventListener('click', function() {
        if (!this.disabled) {
            this.classList.add('loading');
        }
    });
});