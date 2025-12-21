const API_BASE = "https://harrineapi-eub0ezcyh0cwadey.centralindia-01.azurewebsites.net/api/Upload";


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

    $("#save").on("click", function () {
        console.log("Save is clicked", $("#editid").val());
        //saveEditedProduct($("#editid").val());
        saveEditedProduct("0");
    });

});

function getSelectedSizes() {
    var sizes = [];

    $('input[name="sizes[]"]:checked').each(function () {
        sizes.push($(this).val());
    });

    return sizes.join(",");
}


function saveEditedProduct(isedit) {
    getPublicIp().then(ip => {
        if (isedit != "0") {
            var updatedData = {
                id: $("#editid").val(),
                mode: "EditProduct",
                productype: $("#editProductType").val(),
                productname: $("#editImageName").val(),
                uptodays: $("#editUptoDays").val(),
                imageurl: $("#editImageUrl").val(),
                userid: "innlook@gmail.com",
                ipaddress: ip || "0.0.0.0"
            };
        }
        else {
            var updatedData = {
                id: $("#editid").val(),
                mode: "InsertProduct",
                categoryid: $('#category').val(),
                productype: $("#category").text(),
                productname: $("#product_name").val(),
                uptodays: "10",
                imageurl: $("#productImageUrl").val(),
                desc: $("#description").val(),
                info:$("#additionalInfo").val(),
                price: $("#price").val(),
                discount: $("#discount").val(),
                stock: $("#stock").val(),
                size: getSelectedSizes(),
                userid: "innlook@gmail.com",
                ipaddress: ip || "0.0.0.0"
            };
        }

        $.ajax({
            //url: 'http://localhost:5198/api/Upload/EditProduct',
            url: `${API_BASE}/EditProduct`,
            type: 'POST',
            data: JSON.stringify(updatedData),
            contentType: 'application/json',
            success: function (res) {
                if (res[0].msg == "success") {
                    showToast("Product updated successfully!", "success");
                    $("#editModal").hide();
                    $("#productgrid").flexReload();
                    closeEditModal();
                    clearall();
                }
                else {
                    showToast(res[0].msg, "error");
                }
            },
            error: function () {
                showToast("Error updating product!", "error");
            }
        });
    });
}

function uploadProductImage() {

    var file = $("#productImageFile")[0].files[0];

    if (!file) {
        alert("Please select an image.");
        return;
    }

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
            } else {
                alert("Image upload failed.");
            }
        },
        error: function (err) {
            console.log(err);
            alert("Error uploading image.");
        }
    });
}