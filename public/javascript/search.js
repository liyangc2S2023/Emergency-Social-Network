function searchKeywords() {
    const params = {
        content: 'username',
        criteria: 'sa',
        sender: '',
        receiver: '',
        page: 0
      };
    axios.get('/api/v1/search', {params}).then(res => {
        console.log(res.data.data);
    })
}