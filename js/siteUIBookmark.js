let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderBookmarks();
    $('#createBookmark').on("click", async function () {
        saveContentScrollPosition();
        renderCreateBookmarkForm();
    });
    $('#abort').on("click", async function () {
        renderBookmarks();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}
async function renderBookmarks() { 
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createBookmark").show();
    $("#abort").hide();
    let bookmarks = await API_GetBookmarks();
    let categoriesList = [];
    eraseContent();
    if (bookmarks !== null) {

        bookmarks.forEach(bookmark => {
            if (!categoriesList.includes(bookmark.Category))
                categoriesList.push(bookmark.Category);
        });
        updateDropDownMenu(categoriesList);
        bookmarks.forEach(bookmark => {
            if (bookmark.Category === selectedCategory || selectedCategory === '')
                $("#content").append(renderBookmark(bookmark));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditBookmarkForm(parseInt($(this).attr("editContactId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteContactForm(parseInt($(this).attr("deleteContactId")));
        });
        $(".contactRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
function renderBookmark(bookmark) { 
    return $(`
        <a href=${bookmark.Url}>
     <div class="contactRow" contact_id=${bookmark.Id}">
        <div class="bookmarkContainer noselect">
            <div class="bookmarkLayout">
                <span class="contactLogo"><img src='https://www.google.com/s2/favicons?sz=32&domain_url=${bookmark.Url}'' /></span>
                <span class="bookmarkName">${bookmark.Title}</span>
                <span class="bookmarkCategory">${bookmark.Category}</span>
            </div>
            </a> 
            <div class="contactCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editContactId="${bookmark.Id}" title="Modifier ${bookmark.Title}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteContactId="${bookmark.Id}" title="Effacer ${bookmark.Title}"></span>
            </div>
        </div>
    </div> 
             
    `);
}
function renderAbout() { //PAS FINI
    saveContentScrollPosition();
    eraseContent();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de contacts</h2>
                <hr>
                <p>
                    Petite application de gestion de contacts à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2024
                </p>
            </div>
        `))
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateBookmarkForm() {
    renderBookmarkForm();
}
function renderBookmarkForm(bookmark = null) {
    $("#createBookmark").hide();
    $("#abort").show();
    eraseContent();
    let create = bookmark == null;
    if (create) bookmark = newContact();
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        
        <form class="form" id="bookmarkForm">
        <div ><img class="bookmarkCreateUrlLogo" name="UrlLogo" src='' onerror="this.src='bookmark-logo.svg'" /></div>
            <input type="hidden" name="Id" value="${bookmark.Id}"/>

            <label for="Name" class="form-label">Nom du favoris </label>
            <input 
                class="form-control Alpha"
                name="Title" 
                id="Title" 
                placeholder="ex: Google"
                required
                RequireMessage="Veuillez entrer un nom"
                InvalidMessage="Le favoris comporte un caractère illégal" 
                value="${bookmark.Title}"
            />
            <label for="Phone" class="form-label">Url </label>
            <input
                class="form-control"
                name="Url"
                id="Url"
                placeholder="www.google.com"
                required
                RequireMessage="Veuillez entrer l'url" 
                InvalidMessage="Veuillez entrer un url valide"
                value="${bookmark.Url}" 
            />
            <label for="Email" class="form-label">Catégorie </label>
            <input 
                class="form-control"
                name="Category"
                id="Category"
                placeholder="ex: Fureteur"
                required
                RequireMessage="Veuillez entrer une catégorie" 
                InvalidMessage="Veuillez entrer une catégorie valide"
                value="${bookmark.Category}"
            />
            <hr>
            <input type="submit" value="Enregistrer" id="saveContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#bookmarkForm').on("submit", async function (event) {
        event.preventDefault();
        let bookmark = getFormData($("#bookmarkForm"));
        console.log(bookmark);
        bookmark.Id = parseInt(bookmark.Id);
        showWaitingGif();
        let result = await API_SaveBookmark(bookmark, create);
        if (result)
            renderBookmarks();
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderBookmarks();
    });
    $('input[name=Url]').change(function () {

        $("[name='UrlLogo']").attr('src', 'https://www.google.com/s2/favicons?sz=64&domain_url=' + this.value);




    })
}
function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}
function newContact() {
    bookmark = {};
    bookmark.Id = 0;
    bookmark.Title = "";
    bookmark.Url = "";
    bookmark.Category = "";
    return bookmark;
}
let selectedCategory = "";
function updateDropDownMenu(categories) {
    let DDMenu = $("#DDMenu");
    let selectClass = selectedCategory === "" ? "fa-check" : "fa-fw";
    DDMenu.empty();
    DDMenu.append($(`
<div class="dropdown-item menuItemLayout" id="allCatCmd">
<i class="menuIcon fa ${selectClass} mx-2"></i> Toutes les catégories
</div>
`));
    DDMenu.append($(`<div class="dropdown-divider"></div>`));
    categories.forEach(category => {
        selectClass = selectedCategory === category ? "fa-check" : "fa-fw";
        DDMenu.append($(`
<div class="dropdown-item menuItemLayout category" id="allCatCmd">
<i class="menuIcon fa ${selectClass} mx-2"></i> ${category}
</div>
`));
    })
    DDMenu.append($(`<div class="dropdown-divider"></div> `));
    DDMenu.append($(`
<div class="dropdown-item menuItemLayout" id="aboutCmd">
<i class="menuIcon fa fa-info-circle mx-2"></i> À propos...
</div>
`));
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
    $('#allCatCmd').on("click", function () {
        selectedCategory = "";
        renderBookmarks();
    });
    $('.category').on("click", function () {
        selectedCategory = $(this).text().trim();
        renderBookmarks();
    });
}
async function renderEditBookmarkForm(id) {
    showWaitingGif();
    let bookmark = await API_GetBookmark(id);
    if (bookmark !== null)
        renderBookmarkForm(bookmark);
    else
        renderError("Favoris introuvable!");
}
async function renderDeleteContactForm(id) {
    showWaitingGif();
    $("#createBookmark").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let bookmark = await API_GetBookmark(id);
    eraseContent();
    if (bookmark !== null) {
        $("#content").append(`
        <div class="contactdeleteForm">
            <h4>Effacer le favoris suivant?</h4>
            <br>
            <div class="contactRow" contact_id=${bookmark.Id}">
                <div class="bookmarkContainer noselect">
                    <div class="bookmarkLayout">
                        <span class="contactLogo"><img src='https://www.google.com/s2/favicons?sz=32&domain_url=${bookmark.Url}' /></span>
                        <span class="bookmarkName">${bookmark.Title}</span>
                        <span class="bookmarkCategory">${bookmark.Category}</span>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteContact').on("click", async function () {
            showWaitingGif();
            let result = await API_DeleteBookmark(bookmark.Id);
            if (result)
                renderBookmarks();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderBookmarks();
        });
    } else {
        renderError("Contact introuvable!");
    }
}
