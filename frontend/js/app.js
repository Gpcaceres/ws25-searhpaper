const { createApp } = Vue;

createApp({
    data() {
        return {
            searchQuery: '',
            results: null,
            loading: false,
            error: null,
            currentPage: 1,
            rowsPerPage: 10,
            sortBy: 'relevance',
            viewMode: 'grid',
            // Usar ruta relativa para que nginx haga el proxy
            apiUrl: '/api/search'
        }
    },
    methods: {
        async search() {
            if (!this.searchQuery.trim()) return;
            
            this.currentPage = 1;
            await this.fetchResults();
        },
        
        async fetchResults() {
            this.loading = true;
            this.error = null;
            
            try {
                const response = await axios.get(this.apiUrl, {
                    params: {
                        q: this.searchQuery,
                        page: this.currentPage,
                        rows: this.rowsPerPage
                    }
                });
                
                this.results = response.data;
                this.sortResults();
            } catch (err) {
                this.error = err.response?.data?.message || 'Error searching articles. Make sure the server is running.';
                console.error('Search error:', err);
            } finally {
                this.loading = false;
            }
        },
        
        sortResults() {
            if (!this.results || !this.results.papers) return;
            
            const papers = [...this.results.papers];
            
            switch(this.sortBy) {
                case 'year-desc':
                    papers.sort((a, b) => {
                        const dateA = new Date(a.publicationDate || 0);
                        const dateB = new Date(b.publicationDate || 0);
                        return dateB - dateA;
                    });
                    break;
                case 'year-asc':
                    papers.sort((a, b) => {
                        const dateA = new Date(a.publicationDate || 0);
                        const dateB = new Date(b.publicationDate || 0);
                        return dateA - dateB;
                    });
                    break;
                case 'title-asc':
                    papers.sort((a, b) => {
                        const titleA = (a.title || '').toLowerCase();
                        const titleB = (b.title || '').toLowerCase();
                        return titleA.localeCompare(titleB);
                    });
                    break;
                case 'title-desc':
                    papers.sort((a, b) => {
                        const titleA = (a.title || '').toLowerCase();
                        const titleB = (b.title || '').toLowerCase();
                        return titleB.localeCompare(titleA);
                    });
                    break;
                default:
                    // relevance - no sorting needed (API default)
                    break;
            }
            
            this.results.papers = papers;
        },
        
        changeSortOrder() {
            this.sortResults();
        },
        
        toggleView(mode) {
            this.viewMode = mode;
        },
        
        getVisiblePages() {
            if (!this.results) return [];
            const total = this.results.totalPages;
            const current = this.currentPage;
            const pages = [];
            
            if (total <= 7) {
                for (let i = 1; i <= total; i++) {
                    pages.push(i);
                }
            } else {
                if (current <= 3) {
                    pages.push(1, 2, 3, 4, '...', total);
                } else if (current >= total - 2) {
                    pages.push(1, '...', total - 3, total - 2, total - 1, total);
                } else {
                    pages.push(1, '...', current - 1, current, current + 1, '...', total);
                }
            }
            
            return pages;
        },
        
        async goToPage(page) {
            if (page < 1 || page > this.results.totalPages) return;
            
            this.currentPage = page;
            await this.fetchResults();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        },
        
        formatDate(dateString) {
            if (!dateString) return 'N/A';
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        },
        
        formatAuthors(authors) {
            if (!authors || authors.length === 0) return 'Not specified';
            if (authors.length <= 3) return authors.join(', ');
            return `${authors.slice(0, 3).join(', ')} et al.`;
        }
    }
}).mount('#app');
