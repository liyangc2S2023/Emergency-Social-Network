function searchKeywords() {
    const params = {
        content: $('#searchDropdown').val(),
        criteria: $('#inputSearchInfo').val(),
        sender: $('#currentUsername').val(),
        receiver: $('#chatPrivateReceiver').val(),
        page: 0
      };
    axios.get('/api/v1/search', {params}).then(res => {
        const results = res.data.data;
        const resultsContainer = $('.container.searchResults');
        resultsContainer.empty(); // clear any previous search results
        // TODO: append each result to the resultsContainer
    })
}