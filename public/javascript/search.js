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
    axios.get('/search', { params }).then(res => {
        const results = res.data.data.renderedResult;
        const resultsLength = res.data.data.resultsLength;
        if (resultsLength === 0) {
            $('#hasResult').val(false);
        } else {
            $('#hasResult').val(true);
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
