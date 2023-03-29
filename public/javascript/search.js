function clickSearchButton(){
    $('#pageNumber').val(0);
    searchKeywords();
}

function searchKeywords() {
    $('#pageMenu').show();
    const params = {
        context: $('#searchDropdown').val(),
        criteria: $('#inputSearchInfo').val(),
        sender: $('#currentUsername').val(),
        receiver: $('#chatPrivateReceiver').val(),
        page: $('#pageNumber').val()
    };
    axios.get('/api/v1/search', { params }).then(res => {
        const results = res.data.data.renderedResult;
        const hasResult = res.data.data.hasResult;
        if (hasResult) {
            $('#hasResult').val(true);
        } else {
            $('#hasResult').val(false);
        }
        const resultsContainer = $('.container.searchResults');
        resultsContainer.empty(); // clear any previous search results
        resultsContainer.html(results)
    })
}

function searchPrevPage() {
    let page = parseInt($('#pageNumber').val());
    if (page > 0) {
        $('#pageNumber').val(page - 1);
        searchKeywords();
    }
}

function searchNextPage() {
    let page = parseInt($('#pageNumber').val());
    if ($('#hasResult').val() === true) {
        $('#pageNumber').val(page + 1);
        searchKeywords();
    }
}
