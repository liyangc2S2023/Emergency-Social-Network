function searchKeywords() {
  const params = {
    context: $('#searchDropdown').val(),
    criteria: $('#inputSearchInfo').val(),
    sender: $('#currentUsername').val(),
    receiver: $('#chatPrivateReceiver').val(),
    page: 0
  };
  console.log("searching with params: ", params)

  axios.get('/api/v1/search', { params }).then(res => {
    console.log("search result: ", res.data)
    const results = res.data.data;
    const resultsContainer = $('.container.searchResults');
    resultsContainer.empty(); // clear any previous search results
    resultsContainer.html(results)
    // TODO: append each result to the resultsContainer
  })
}