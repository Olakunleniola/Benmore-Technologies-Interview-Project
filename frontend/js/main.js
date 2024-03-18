// Handle Django CSRF Token for submission of forms
$.ajaxSetup({
    beforeSend: function beforeSend(xhr, settings) {
        function getCookie(name) {
            let cookieValue = null;


            if (document.cookie && document.cookie !== '') {
                const cookies = document.cookie.split(';');

                for (let i = 0; i < cookies.length; i += 1) {
                    const cookie = jQuery.trim(cookies[i]);

                    // Does this cookie string begin with the name we want?
                    if (cookie.substring(0, name.length + 1) === (`${name}=`)) {
                        cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                        break;
                    }
                }
            }

            return cookieValue;
        }

        if (!(/^http:.*/.test(settings.url) || /^https:.*/.test(settings.url))) {
            // Only send the token to relative URLs i.e. locally.
            xhr.setRequestHeader('X-CSRFToken', getCookie('csrftoken'));
        }
    },
});

// Toogle Create New Project Modal 
$(document).on("click", ".toggle-project-modal", function(e) {
    e.preventDefault()
    $(".project-modal").toggleClass("hidden")
    // #TODO: clear file in file input
})

// Toogle Create new Task Modal
.on("click", ".toggle-task-modal", function(e){
    $(".task-modal").toggleClass("hidden");
    $(".js-task-submit").data("parentid", $(this).data("parentid"))
    $(".js-task-submit").data("url",$(this).data("url"))
})

//  .........Create New Task............
.on("click", ".js-task-submit", function(e){
    const $btn = $(this);
    const title = $(".task-title").val().trim();
    const description = $(".task-description").val().trim();
    const buttonInnerHtml = $btn.html(); 
    const completed_task = $('#completed_task').prop("checked");
    const $parent = $(`#${$btn.data("parentid")}`);
    
    if(!title.length){
        $(".task-title").addClass("red_shadow placeholder:text-red-400").prop("placeholder", "This field is required")
        setTimeout(() => {
            $(".task-title").removeClass("red_shadow placeholder:text-red-400").prop("placeholder", "Enter Task Title")
        }, 5000)
        return
    }
    

    $btn.prop("disabled", true).text("Creating....");

    $.ajax({
        type: "POST",
        url: $btn.data("url"),
        data: {
            title: title,
            description: description,
            completed_task: completed_task
        },
        
        success: (htmlData) => {
            // console.log(htmlData)    
            $(".task-modal").addClass("hidden");
            $btn.prop("disabled", false).html(buttonInnerHtml)
            $(".task-description").val("");
            $('.task-title').val("");
            $parent.html(htmlData);
        },

        error: (error) => {
            console.warn(error.responseJSON);
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

//  ...........Create New Project.........
.on("click", ".js-project-submit", function(e){
    e.preventDefault();
    const $btn = $(this);
    const $textarea = $(".project-name");
    const text = $textarea.val().trim();
    const buttonInnerHtml = $btn.html(); 
    const imageFile = $('#new_upload').prop("files")[0];

    if(!text.length){
        $(".project-name").addClass("red_shadow placeholder:text-red-400").prop("placeholder", "This field is required")
        setTimeout(() => {
            $(".project-name").removeClass("red_shadow placeholder:text-red-400").prop("placeholder", "Enter Project Title/Name......")
        }, 5000)
        return
    }
    
    const formData = new FormData();
    formData.append('title', text);
    formData.append('image', imageFile);


    $btn.prop("disabled", true).text("Creating....");

    $.ajax({
        type: "POST",
        url: "/",
        data: formData,
        processData: false,  // Prevent jQuery from processing data
        contentType: false,  // Prevent jQuery from setting content type

        success: (htmlData) => {    
            $(".project_container").prepend(htmlData)
            $btn.prop("disabled", false).html(buttonInnerHtml)
            $(".project-modal").addClass("hidden");
            $textarea.val("");
            $('#upload').val("");
            $("#prev").addClass("hidden");
            $(".project-modal").addClass("hidden")
        },

        error: (error) => {
            console.warn(error.responseJSON);
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


//  Search Project by Title/Name
.on("click", "#search_botton", function(e) {
    e.preventDefault()
    const $searchBar = $(".search-bar")
    const query = $searchBar.val().trim()
    if (!query){return}
    
    $.ajax ({
        type: "GET",
        url: `/?query=${query}`,

        success: (htmlData) => {
            $searchBar.val("")
            $('#result_container').html(htmlData)
        },

        error: (e) => {
            $searchBar.addClass("text-red-500 font-bold")
            $(".search-div").addClass("red_shadow")
            if (e.hasOwnProperty('responseJSON')) {
                $searchBar.val(e.responseJSON.error) 
            }
            else {
                console.warn(e)
                $searchBar.val("OOpsss!!!! An Error Occurred.... Try again later.......")  
            }
            setTimeout(() => {
                $searchBar.removeClass("text-red-500 font-bold")
                $(".search-div").removeClass("red_shadow")
                $searchBar.val("")
            },5000)
        }
    })
})


// Filter Project by Status
.on("change", "#filter_project", function(e) {
    $selector = $(this)

    $.ajax ({
        type: "GET",
        url: `/?percentage=${$selector.val()}`,

        success: (htmlData) => {
            $('#result_container').html(htmlData)
        },

        error: (e) => {
            console.log(e)
            $selector.addClass("text-red-500 red_shadow").text("Error")
            setTimeout(() => {
                $selector.removeClass("text-red-500 red_shadow").val("All").text("All")
            },5000)
        },
    })
})

// Edit Project
.on("click", "#save-edit", function(e){
    const parent_id = $(this).data("parent_id")
    const newTitle = $(`#${parent_id} #editname`).val()
    const newImg = $(`#${parent_id} input[type=file]`).prop("files")[0]
    const $parent = $(`#${parent_id}`)
    const target = e.target;
    const formData = new FormData()
    if(!newTitle.length && !newImg){closeEdit(target); return;}
    
    if (newTitle.length){formData.append("title", newTitle.trim())}
    if (newImg){formData.append("image", newImg)}

    $.ajax({
        type: "POST",
        url: $(this).data("url"),
        data: formData,
        processData: false,  // Prevent jQuery from processing data
        contentType: false,

        success: (htmlData) => {
            $parent.html(htmlData)
        },

        error: (e) => {
            console.log(e)
            closeEdit(target);
            displayError(parent_id)
        }
    })

})

// Delete Project
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

// Cancel Edit 
function closeEdit(element) {
    const parent_id = element.getAttribute("data-parent_id")
    const $edits = $(`#${parent_id} .edit`)
    $(`#${parent_id} #projectimg`).css("display", "block")
    $(`#${parent_id} #projectinfo`).css("display", "block")
    $(`#${parent_id} input[type=file]`).val('')
    $edits.css("display", "none")
}

// Edit Project Command
function editParent (element) {
    const parent_id = element.getAttribute("data-parentid")
    const $edits = $(`#${parent_id} .edit`)
    $(`#${parent_id} #projectimg`).css("display", "none")
    $(`#${parent_id} #projectinfo`).css("display", "none")
    $edits.css("display", "flex")
}

// Image Previewer Helper Function
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

//  Display Error Helper Function
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

