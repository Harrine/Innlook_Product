const API_BASE = "https://harrineapi-eub0ezcyh0cwadey.centralindia-01.azurewebsites.net/api/Upload";

let skuData = [];

$(document).ready(function () {
    showLoader();
    GetSkuNo();

    $('#skuSelect').on('change', function () {
        const selectedSku = $(this).val();

        if (!selectedSku) {
            // No SKU selected → hide image, show placeholder
            $('#product-image').hide();
            $('.placeholder').show();
            return;
        }

        const selectedItem = skuData.find(item => item.sku_no === selectedSku);

        if (selectedItem && selectedItem.imageurl) {
            showLoader();
            $('#product-image')
                .attr('src', selectedItem.imageurl)
                .on('load', function () {
                    $(this).show();            
                    $('.placeholder').hide();  
                    hideLoader();
                })
                .on('error', function () {
                    $(this).attr('src', 'https://via.placeholder.com/600x400?text=Image+Not+Found');
                    $(this).show();
                    $('.placeholder').hide();
                    hideLoader();
                });
        } else {
            $('#product-image').hide();
            $('.placeholder').show();
            showToast("No image available for this SKU", "warning");
        }
    });
});

function GetSkuNo() {

    getPublicIp().then(ip => {
        var requestData = {
            mode: "GetAllSku_No_With_Image",
            userid: "innlook@gmail.com",
            ipaddress: ip || "0.0.0.0",
            id: "0"
        };

        $.ajax({
            //url: 'http://localhost:5198/api/Upload/EditGetData',
            url: `${API_BASE}/GetDataMaster`,
            type: 'POST',
            data: JSON.stringify(requestData),
            contentType: 'application/json',
            success: function (res) {
                console.log("response : ", res.Table0);
                skuData = res.Table0;

                skuData.forEach(element => {
                    console.log(element);
                    $('#skuSelect').append(
                        $('<option>', {
                            value: element.sku_no,
                            text: element.sku_no,
                            'data-image': element.imageurl || ''
                        })
                    );
                });
                hideLoader();
            },
            error: function () {
                hideLoader();
                showToast("Error updating product!", "error");
            }
        });
    });
}