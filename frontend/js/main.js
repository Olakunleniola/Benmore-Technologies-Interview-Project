$(document).on("click", ".toggle-project-modal", function(e) {
    e.preventDefault()
    $(".project-modal").toggleClass("hidden")
    // #TODO: clear file in file input
})

.on("click", ".js-project-submit", function(e){
    e.preventDefault();
    const $btn = $(this);
    const $textarea = $(".project-name");
    const text = $textarea.val().trim();
    const buttonInnerHtml = $btn.html(); 
    const imageFile = $('#new_upload').prop("files")[0];
    
    console.log(text)

    if(!text.length && !imageFile){return false}
    
    const formData = new FormData();
    formData.append('post', text);
    formData.append('image', imageFile);


    $btn.prop("disabled", true).text("Creating....");

    $.ajax({
        type: "POST",
        url: $textarea.data("post-url"),
        data: formData,
        processData: false,  // Prevent jQuery from processing data
        contentType: false,  // Prevent jQuery from setting content type

        success: (htmlData) => {    
            $(".post-container").prepend(htmlData)
            $btn.prop("disabled", false).html(buttonInnerHtml)
            $(".project-modal").addClass("hidden");
            $textarea.val("");
            $('#upload').val("");
            $("#prev").addClass("hidden");
        },

        error: (error) => {
            console.warn(error);
            $btn.addClass("bg-red-500 text-white");
            $btn.prop("diabled", false).text("Error").css("background-color", "red");
            setTimeout(() => {
                $btn.removeClass("bg-red-500 text-white");
                $btn.prop("disabled", false).html(buttonInnerHtml).css("background-color", "white")
                $(".project-modal").addClass("hidden")
            }, 5000)
        }
    })
})



.on("click", "#search_botton", function(e) {
    const $searchBar = $(".search-bar")
    const query = $searchBar.val()
    if (!query){return}
    console.log(query) 
    
    $.ajax ({
        type: "GET",
        url: $(this).data("url"),
        data: query,

        success: (data) => {
            console.log(data)
        },

        error: (e) => {
            console.log(e)
            $searchBar.addClass("text-red-500 font-bold")
            $(".search-div").addClass("red_shadow")
            $searchBar.val("OOpsss!!!! An Error Occurred.... Try again later.......")
            setTimeout(() => {
                $searchBar.removeClass("text-red-500 font-bold")
                $(".search-div").removeClass("red_shadow")
                $searchBar.val("")
            },5000)
        }
    })
})





.on("click", "#save-edit", function(e){
    const parent_id = $(this).data("parent_id")
    const newTitle = $(`#${parent_id} #editname`).val()
    const newImg = $(`#${parent_id} input[type=file]`).prop("files")[0]
    const target = e.target;
    const formData = new FormData() 
    if(!newTitle && !newImg){closeEdit(target); return ;}
    
    if (newTitle){formData.append("title", newTitle.trim())}
    if (newImg){formData.append("image", newImg)}

    $.ajax({
        type: "PUT",
        url: $(this).data("url"),
        data: formData,
        processData: false,  // Prevent jQuery from processing data
        contentType: false,

        success: (data) => {
            console.log("success")
        },

        error: (e) => {
            console.log(e)
            closeEdit(target);
            displayError(parent_id)
        }
    })

})




function deleteParent (element) {
    const parent_id = element.getAttribute("data-parentid")
    const $parent = $(`#${parent_id}`)
    
    $.ajax({
        type: "DELETE",
        url: element.getAttribute("data-url"),
        
        success:() =>  {
            $parent.remove()
        },
        
        error: (e) => {
            console.log(e)
            displayError(parent_id)
        }
    })
}






function closeEdit(element) {
    const parent_id = element.getAttribute("data-parent_id")
    const $edits = $(`#${parent_id} .edit`)
    $(`#${parent_id} #projectimg`).css("display", "block")
    $(`#${parent_id} #projectinfo`).css("display", "block")
    $(`#${parent_id} input[type=file]`).val('')
    $edits.css("display", "none")
}


function editParent (element) {
    const parent_id = element.getAttribute("data-parentid")
    const $edits = $(`#${parent_id} .edit`)
    $(`#${parent_id} #projectimg`).css("display", "none")
    $(`#${parent_id} #projectinfo`).css("display", "none")
    $edits.css("display", "flex")
}


function previewImage(input, previewTargetId) {
    const $preview = $(previewTargetId);
    $preview.removeClass("hidden")
    if (input.files && input.files[0]) {
        const reader = new FileReader();

        reader.onload = function (e) {  
            $preview.attr("src", e.target.result);
        };
        reader.readAsDataURL(input.files[0]);
    }else {
        console.log("csdvsdvsdvsdvsdvsdvds")
    }
}


function displayError(id) {
    const $parent = $(`#${id}`)
    const $errorDisplay = $(`#${id} #error_display`)
    $errorDisplay.css("display", "block")
    $errorDisplay.text("Error Occurred! Try later...")
    $parent.addClass("red_shadow")
    setTimeout(() => {
        $parent.removeClass("red_shadow")
        $errorDisplay.css("display", "none")
    },5000)
}   