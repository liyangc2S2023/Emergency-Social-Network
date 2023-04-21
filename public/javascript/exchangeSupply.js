function displaySupplyForm() {
    $("#supplyModal").modal('show')
}

function editSupplyForm(name, quantity, id) {
    $("#supplyNameInput").val(name);
    $("#supplyQuantityInput").val(quantity);
    //console.log($("#currentSupplyID").val());
    $("#supplyModal").modal('show')
    $("#currentSupplyID").val(id);
}

function displayExchangeForm(name, quantity, owner, id) {
    const supply = { name, quantity, owner, id };
    console.log(supply)
    $("#exchangeModal").modal('show')
    $("#supplyDeal").text('Supply:'+name);
    $("#supplyDeal").val(name);
    $("#quantityDeal").text('quantity:'+quantity);
    $("#quantityDeal").val(quantity);
    $("#owner").text('owner:'+owner);
    $("#owner").val(owner);
    // $("#categoryDeal").val(category);
    $("#currentSupplyID").val(id);
}

function clearSupplyForm() {
    $("#supplyNameInput").val('');
    $("#supplyQuantityInput").val('');
    $("#supplyNameInput").text('');
    $("#supplyQuantityInput").text('');
}

function submitSupply() {
    const supplyName = $("#supplyNameInput").val();
    const quantity = $("#supplyQuantityInput").val();
    const category = $('#supplyCategoryInput :selected').text();
    // judge if quantity is a number
    if (!supplyName || !quantity || !category || quantity < 0) {
        alert("Please fill out all fields")
    } else if (isNaN(quantity)) {
        alert("Quantity must be a number")
    }
    else {
        const supply = { name: supplyName, quantity, category };
        if ($("#currentSupplyID").val()) {
            // console.log($("#currentSupplyID").val());
            axios.post(`/api/v1/supplies/${$("#currentSupplyID").val()}`, supply).then((res) => {
                $("#supplyModal").modal('hide');
                clearSupplyForm();
            });
        }
        else {
            if (quantity == 0) {
                alert("Quantity cannot be 0");
            } else {
                axios.post("/api/v1/supplies", supply).then((res) => {
                    $("#supplyModal").modal('hide');
                    clearSupplyForm();
                });
            }
        }
    }
    $("#currentSupplyID").val('');
}


function clearExchangeForm() {
    $("#supplyReqNameInput").val('');
    $("#supplyReqQuantityInput").val('');
    $("#supplyReqNameInput").text('');
    $("#supplyReqQuantityInput").text('');
    $("#supplyDealQuantityInput").val('');
    $("#supplyDealQuantityInput").text('');
}

function submitExchange() {
    const exchange = {
        requester: $("#currentUsername").val(),
        dealer: $("#owner").val(),
        supplyReq: $("#supplyReqNameInput").val(),
        supplyDeal: $("#supplyDeal").val(),
        quantityReq: $("#supplyReqQuantityInput").val(),
        quantityDeal: $("#supplyDealQuantityInput").val(),
        status: "pending",
        supplyID: $("#currentSupplyID").val()
    }
    console.log(exchange);
    if (!exchange.supplyReq || !exchange.quantityReq || exchange.quantityReq < 0) {
        alert("Please fill out all fields")
    } else if (isNaN(exchange.quantityReq) || isNaN(exchange.quantityDeal)) {
        alert("Quantity must be a number")
    } else if (exchange.quantityReq > $("#quangtiyDeal").val()) {
        alert("Quantity cannot be more than the supply")
    } else {
        axios.post(`/api/v1/exchange/${exchange.requester}/${exchange.dealer}`, exchange).then((res) => {
            clearExchangeForm();
            $("#exchangeModal").modal('hide');
        });
    }
    $("#currentSupplyID").val('');
}

function rejectExchange(id, requester) {
    axios.post("/api/v1/exchange/rejection", { id, requester }).then((res) => {
        console.log("exchangeExtraInfo-" + id);
        $("#exchangeExtraInfo-" + id).html("<p class='exchangeRejected'>The exchange has been rejected</p>");
    });
}

function cancelExchange(id, dealer) {
    axios.post("/api/v1/exchange/cancellation", { id, dealer }).then((res) => {
        $("#exchangeExtraInfo-" + id).html("<p class='exchangeCancelled'>The exchange has been cancelled</p>");
    });
}

function acceptExchange(id, requester) {
    axios.post("/api/v1/exchange/acception", { id, requester }).then((res) => {
        if (res.data.success) {
            $("#exchangeExtraInfo-" + id).html("<p class='exchangeAccepted'>The exchange has been accepted</p>");
        } else {
            alert(res.data.message);
        }
    });
}

socket.on('newSupply', (supplyHTML, sender) => {
    if (sender !== $("#currentUsername").val()) {
        $("#supplyItemList").prepend(supplyHTML);
    }
});

socket.on('selfNewSupply', (supplyHtml) => {
    $("#supplyItemList").prepend(supplyHtml);
});

socket.on('newExchange', (exchangeHtml) => {
    $("#exchangeList").prepend(exchangeHtml);
});

socket.on('changeSupply', (supply) => {
    console.log(supply);
    if (supply.quantity === 0) {
        $("#supplyItem-" + supply._id).hide();
    } else {
        $("#supplyName-" + supply._id).val(supply.name);
        $("#supplyQuantity-" + supply._id).text(`quantity: ${supply.quantity}`);
    }
});

socket.on('exchangeRejected', (id) => {
    $("#exchangeExtraInfo-" + id).html("<p class='exchangeRejected'>The exchange has been rejected</p>");
});

socket.on('exchangeCancelled', (id) => {
    $("#exchangeExtraInfo-" + id).html("<p class='exchangeCancelled'>The exchange has been cancelled</p>");
});

socket.on('exchangeAccepted', (id) => {
    console.log(id);
    $("#exchangeExtraInfo-" + id).html("<p class='exchangeAccepted'>The exchange has been accepted</p>");
});

socket.on('supplyQuantityChange', (supplyId, quantity) => {
    if (quantity === 0) {
        $("#supplyItem-" + supplyId).hide();
    } else {
        $("#supplyQuantity-" + supplyId).text(`quantity: ${quantity}`);
    }
});
