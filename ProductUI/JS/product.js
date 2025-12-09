
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

const API_BASE = "https://harrineapi-eub0ezcyh0cwadey.centralindia-01.azurewebsites.net/api/Upload";

$(function () {

    $("#productgrid").flexigrid({
        //url: 'http://localhost:5198/api/Upload/GetAll', // ✅ API URL
        url: `${API_BASE}/GetAll`, // ✅ API URL
        method: 'POST',
        dataType: 'json',
        colModel: [
            {
                display: 'Edit', name: 'edit', width: 180, sortable: true, align: 'center',
                process: function (cellDiv, rowId) {
                    $(cellDiv).html(`
                        <i class="fa fa-pen-to-square edit-btn" onclick="editProduct('${rowId}')"></i>
                    `);
                }
            },
            { display: 'Product Type', name: 'ProductType', width: 180, sortable: true, align: 'center' },
            { display: 'Image Name', name: 'ImageName', width: 200, sortable: true, align: 'center' },
            { display: 'Upto Days', name: 'UptoDays', width: 80, sortable: true, align: 'center' },
            {
                display: 'Image', name: 'ProductImageUrl', width: 400, align: 'center',
                process: function (cellDiv) {
                    // console.log("celldiv : ", cellDiv);
                    var url = $(cellDiv).text();
                    $(cellDiv).html(`<img src="${url}" width="200" height="200" style="width:170px;height:170px;object-fit:cover;border-radius:12px;box-shadow:0 0 8px #c4c4c4;">`);
                }
            },
            {
                display: 'Delete', name: 'delete', width: 180, sortable: true, align: 'center',
                process: function (cellDiv, rowId) {
                    // console.log("For delete")
                    $(cellDiv).html(`
                        <i class="fa fa-trash delete-btn" onclick="deleteProduct('${rowId}')"></i>
                    `);
                }
            },
        ],
        sortname: "ProductType",
        sortorder: "asc",
        usepager: true,
        rp: 10,
        title: "InnLook Products's",
        height: 480,
        width: '100%',
        buttons: [
            {
                name: 'Add New',
                bclass: 'add',
                onpress: function () {
                    editProduct("0");
                }
            }
        ],
        onSubmit: function () {

            var page = $('.pcontrol input', '.pDiv').val() || 1;

            getPublicIp().then(ip => {
                var requestData = {
                    mode: "GetAllProducts",
                    userid: "innlook@gmail.com",
                    ipaddress: ip || "0.0.0.0",
                    page: parseInt(page)
                };

                $.ajax({
                    //url: 'http://localhost:5198/api/Upload/GetAll',
                    url: `${API_BASE}/GetAll`,
                    type: 'POST',
                    data: JSON.stringify(requestData),
                    contentType: 'application/json',
                    success: function (data) {
                        $("#productgrid").flexAddData(data);
                    },
                    error: function (xhr) {
                        alert("API Error: " + xhr.status + " " + xhr.statusText);
                    }
                });
            });
            return false;
        }

    });

});

$(document).ready(function () {

    $("#save").on("click", function () {
        console.log("Save is clicked", $("#editid").val());
        saveEditedProduct($("#editid").val());

    });

    $("#productgrid").on("click", ".bDiv tr", function () {
        $(".bDiv tr").removeClass("row-selected");
        $(this).addClass("row-selected");
    });

});


function editProduct(id) {
    console.log("Edit is called .", id);
    if (id != "0") {

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
                    console.log("response : ", res[0].id);

                    $("#editid").val(res[0].id);
                    $("#editProductType").val(res[0].ProductType);
                    $("#editImageName").val(res[0].ImageName);
                    $("#editUptoDays").val(res[0].UptoDays);
                    $("#editImagePreview").attr("src", res[0].ProductImageUrl);
                    $("#editImagePreview").css('display', 'block');
                    // $("#editImageUrl").val(imageUrl);
                    $("#editModal").css("display", "flex");
                },
                error: function () {

                    showToast("Error updating product!", "error");
                }
            });
        });
        // $("#editProductType").val(productType);
    }
    else {
        $("#editid").val("0");
        $("#editProductType").val("");
        $("#editImageName").val("");
        $("#editUptoDays").val("");
        $("#editImagePreview").css('display', 'none');
        $("#editImagePreview").attr("src", "");
        $("#editModal").css("display", "flex");
    }
    // $("#editImageName").val(imageName);
    // $("#editUptoDays").val(uptoDays);
    // $("#editImagePreview").attr("src", imageUrl);;
    // $("#editImageUrl").val(imageUrl);
    // $("#editModal").css("display", "flex");
}

function closeEditModal() {
    $("#editModal").hide();
}

function uploadEditedImage() {
    var file = $("#editImageFile")[0].files[0];

    if (!file) {
        alert("Please select an image.");
        return;
    }

    // Temporary preview
    $("#editImagePreview").attr("src", URL.createObjectURL(file));

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

                // Set the hidden input value
                $("#editImageUrl").val(data.secure_url);

                // Show final uploaded image
                $("#editImagePreview").attr("src", data.secure_url);
                $("#editImagePreview").css('display', 'block');


                console.log("Uploaded:", data.secure_url);
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

function clearall() {
    $("#editid").val("");
    $("#editProductType").val("");
    $("#editImageName").val("");
    $("#editUptoDays").val("");
    $("#editImagePreview").css('display', 'none');
    $("#editImagePreview").attr("src", "");
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
                productype: $("#editProductType").val(),
                productname: $("#editImageName").val(),
                uptodays: $("#editUptoDays").val(),
                imageurl: $("#editImageUrl").val(),
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

function deleteProduct(id) {
    getPublicIp().then(ip => {
        var requestData = {
            mode: "DeleteProduct",
            userid: "innlook@gmail.com",
            ipaddress: ip || "0.0.0.0",
            id: id
        };

        $.ajax({
            //url: 'http://localhost:5198/api/Upload/DeleteProduct',
            url: `${API_BASE}/DeleteProduct`,
            type: 'POST',
            data: JSON.stringify(requestData),
            contentType: 'application/json',
            success: function (response) {
                // console.log("response of delete function:", response);

                // ✅ Check if success message exists
                if (Array.isArray(response) && response.length > 0 && response[0].msg === "success") {
                    showToast("✅ Product deleted successfully!", "success");
                    $("#productgrid").flexReload();
                } else {
                    showToast("⚠️ Failed to delete the product.", "error");
                }
            },
            error: function (xhr) {
                alert("API Error: " + xhr.status + " " + xhr.statusText);
            }
        });
    });
}


