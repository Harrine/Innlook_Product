const API_BASE = "https://harrineapi-eub0ezcyh0cwadey.centralindia-01.azurewebsites.net/api/Upload";
var id = "-1";

async function getPublicIp() {
    try {
        const resp = await fetch('https://api.ipify.org?format=json');
        if (!resp.ok) throw new Error('ip service not available');
        const data = await resp.json();
        return data.ip; // string like "203.0.113.5"
    } catch (err) {
        //console.warn('Could not fetch public IP:', err);
        return null;
    }
}

$(document).ready(function () {

    const params = new URLSearchParams(window.location.search);

    id = params.get('id');
    id != null ? id : "0";
    console.log("URL Params:", id);

    if (id && id !== "0") {
        console.log("Edit mode Getting data for id : ", id);
        EditGetProductById(id);
    }

    //alert("JS loaded");
    console.log("JS loaded");


    $(".form-grid").on("submit", function (e) {
        e.preventDefault(); // 🚫 stop page reload

        console.log("Save is clicked", $("#editid").val());

        // Decide insert or edit
        if (id && id !== "0") {
            saveEditedProduct(id);
        } else {
            saveEditedProduct("0");
        }
    });

});

function getSelectedSizes() {
    var sizes = [];

    $('input[name="sizes[]"]:checked').each(function () {
        sizes.push($(this).val());
    });

    return sizes.join(",");
}

function EditGetProductById(id) {
    showLoader();
    getPublicIp().then(ip => {
        var requestData = {
            mode: "EditGetProductById",
            userid: "innlook@gmail.com",
            ipaddress: ip || "0.0.0.0",
            id: id
        };

        $.ajax({
            //url: 'http://localhost:5198/api/Upload/EditGetData',
            url: `${API_BASE}/EditGetData`,
            type: 'POST',
            data: JSON.stringify(requestData),
            contentType: 'application/json',
            success: function (res) {
                console.log("response : ", res[0]);
                hideLoader();

                $('#title').text("Update Product (" +res[0].sku_no+")");

                $("#editid").val(res[0].id);
                $('#category').val(res[0].categoryid);
                $("#editProductType").val(res[0].ProductType);
                $("#product_name").val(res[0].ImageName);
                $("#uptodays").val(res[0].UptoDays);
                $("#productImagePreview").attr("src", res[0].ProductImageUrl);
                $("#productImageUrl").val(res[0].ProductImageUrl);
                $("#productImagePreview").css('display', 'block');
                $("#description").val(res[0].description    );
                $("#other_info").val(res[0].otherinfo);
                $("#price").val(res[0].price);
                $("#discount").val(res[0].discount);

                var stockVal = res[0].isinstock;
                console.log("Stock Value :", stockVal);
                $('input[name="in_stock"][value="' + stockVal + '"]').prop('checked', true);

                var sizes = res[0].sizes; // "S,M,L"
                console.log("Sizes Value :", sizes);
                if (sizes) {
                    sizes.split(",").forEach(function (s) {
                        $('input[name="sizes[]"][value="' + s + '"]').prop('checked', true);
                    });
                }

                //$("#editModal").css("display", "flex");
            },
            error: function () {
                hideLoader();
                showToast("Error updating product!", "error");
            }
        });
    });
}

function saveEditedProduct(isedit) {
    console.log("Save Edited Product called .", isedit);
    enableSaveButton();
    showLoader();
    getPublicIp().then(ip => {
        if (isedit != "0") {
            var updatedData = {
                id: $("#editid").val(),
                mode: "EditProduct",
                categoryid: $('#category option:selected').val(),
                productype: $("#category option:selected").text(),
                productname: $("#product_name").val(),
                uptodays: "10",
                imageurl: $("#productImageUrl").val(),
                descriptions: $("#description").val(),
                info: $("#other_info").val(),
                price: $("#price").val(),
                discount: $("#discount").val(),
                stock: $('input[name="in_stock"]:checked').val(),
                size: getSelectedSizes(),
                userid: "innlook@gmail.com",
                ipaddress: ip || "0.0.0.0"
            };
        }
        else {
            var updatedData = {
                id: $("#editid").val(),
                mode: "InsertProduct",
                categoryid: $('#category option:selected').val(),
                productype: $("#category option:selected").text(),
                productname: $("#product_name").val(),
                uptodays: "10",
                imageurl: $("#productImageUrl").val(),
                descriptions: $("#description").val(),
                info: $("#other_info").val(),
                price: $("#price").val(),
                discount: $("#discount").val(),
                stock: $('input[name="in_stock"]:checked').val(),
                size: getSelectedSizes(),
                userid: "innlook@gmail.com",
                ipaddress: ip || "0.0.0.0"
            };
        }
        console.log("Updated Data:", updatedData);
        $.ajax({
            //url: 'http://localhost:5198/api/Upload/EditProduct',
            url: `${API_BASE}/EditProduct`,
            type: 'POST',
            data: JSON.stringify(updatedData),
            contentType: 'application/json',
            success: function (res) {
                if (res[0].msg == "success") {
                    hideLoader();
                    enableSaveButton();
                    showToast("Product updated successfully!", "success");
                    $("#editModal").hide();
                    $("#productgrid").flexReload();
                    // closeEditModal();
                    // clearall();
                    setTimeout(() => {
                        window.location.href = "/Product/all_product.html";
                    }, 1000);

                }
                else {
                    hideLoader();
                    showToast(res[0].msg, "error");
                }
            },
            error: function () {
                showToast("Error updating product!", "error");
            }
        });
    }).catch(() => {
        hideLoader();
        enableSaveButton();
        showToast("Network error", "error");
    });
}

function uploadProductImage() {

    var file = $("#productImageFile")[0].files[0];

    if (!file) {
        alert("Please select an image.");
        return;
    }
    showLoader();

    // Temporary local preview
    $("#productImagePreview")
        .attr("src", URL.createObjectURL(file))
        .show();

    var formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "Innlook_Preset");
    formData.append("cloud_name", "dpzdubhdq");

    $.ajax({
        url: "https://api.cloudinary.com/v1_1/dpzdubhdq/image/upload",
        type: "POST",
        data: formData,
        contentType: false,
        processData: false,
        success: function (data) {
            if (data.secure_url) {

                // Save uploaded image URL
                $("#productImageUrl").val(data.secure_url);

                // Show final Cloudinary image
                $("#productImagePreview").attr("src", data.secure_url);

                console.log("Product Image Uploaded:", data.secure_url);
                hideLoader();

            } else {
                hideLoader();
                alert("Image upload failed.");
            }
        },
        error: function (err) {
            console.log(err);
            alert("Error uploading image.");
        }
    });
}

function disableSaveButton() {
    $("#submit_product")
        .prop("disabled", true)
        .addClass("btn-disabled");

    $("#submit_product .btn-text").text("Saving...");
}

function enableSaveButton() {
    $("#submit_product")
        .prop("disabled", false)
        .removeClass("btn-disabled");

    $("#submit_product .btn-text").text("Save Product");
}
