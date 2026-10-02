// ================= SUPABASE CONFIG =================


const SUPABASE_URL =
    "https://zavzopgnxsvsgiofcvic.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_zvfIKhKzrwurmRzbqaZqOw_bCbe2rup";


// Create Supabase client

const supabaseClient =
    window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_KEY
    );


// Storage bucket

const BUCKET_NAME = "photos";


// ================= HTML ELEMENTS =================

const authSection =
    document.getElementById("authSection");

const dashboardSection =
    document.getElementById("dashboardSection");

const authForm =
    document.getElementById("authForm");

const emailInput =
    document.getElementById("email");

const passwordInput =
    document.getElementById("password");

const authMessage =
    document.getElementById("authMessage");

const authButtonText =
    document.getElementById("authButtonText");

const loginTab =
    document.getElementById("loginTab");

const signupTab =
    document.getElementById("signupTab");

const userEmail =
    document.getElementById("userEmail");

const logoutBtn =
    document.getElementById("logoutBtn");

const photoInput =
    document.getElementById("photoInput");

const uploadBtn =
    document.getElementById("uploadBtn");

const uploadMessage =
    document.getElementById("uploadMessage");

const gallery =
    document.getElementById("gallery");

const photoCount =
    document.getElementById("photoCount");

const refreshBtn =
    document.getElementById("refreshBtn");

const previewModal = document.getElementById("previewModal");
const previewImage = document.getElementById("previewImage");
const previewFileName = document.getElementById("previewFileName");
const previewPosition = document.getElementById("previewPosition");
const closePreviewBtn = document.getElementById("closePreviewBtn");
const previousPreviewBtn = document.getElementById("previousPreviewBtn");
const nextPreviewBtn = document.getElementById("nextPreviewBtn");
let previewTrigger = null;
let previewItems = [];
let currentPreviewIndex = 0;

function showPreviewAt(index) {

    if (index < 0 || index >= previewItems.length) {

        return;

    }

    currentPreviewIndex = index;

    const preview = previewItems[currentPreviewIndex];

    previewImage.src = preview.imageUrl;

    previewFileName.textContent = preview.fileName;

    previewPosition.textContent =
        `${currentPreviewIndex + 1} / ${previewItems.length}`;

    const navigationDisabled = previewItems.length < 2;

    previousPreviewBtn.disabled = navigationDisabled;

    nextPreviewBtn.disabled = navigationDisabled;

    previewModal.classList.remove("hidden");

}


function openPreview(imageUrl) {

    previewTrigger = document.activeElement;

    const index = previewItems.findIndex(
        (preview) => preview.imageUrl === imageUrl
    );

    if (index !== -1) {

        showPreviewAt(index);

    }


    closePreviewBtn.focus();
}


function navigatePreview(direction) {

    if (previewItems.length < 2) {

        return;

    }

    const nextIndex =
        (currentPreviewIndex + direction + previewItems.length) %
        previewItems.length;

    showPreviewAt(nextIndex);
}


function closePreview() {

    previewModal.classList.add("hidden");

    previewImage.src = "";

    if (previewTrigger instanceof HTMLElement) {

        previewTrigger.focus();

    }
}


closePreviewBtn.addEventListener(
    "click",
    closePreview
);

previousPreviewBtn.addEventListener(
    "click",
    () => navigatePreview(-1)
);

nextPreviewBtn.addEventListener(
    "click",
    () => navigatePreview(1)
);


previewModal.addEventListener(
    "click",
    (event) => {

        if (event.target === previewModal) {

            closePreview();

        }

    }
);


document.addEventListener(
    "keydown",
    (event) => {

        if (previewModal.classList.contains("hidden")) {

            return;

        }

        if (event.key === "Escape") {

            closePreview();

        }

        if (event.key === "ArrowLeft") {

            navigatePreview(-1);

        }

        if (event.key === "ArrowRight") {

            navigatePreview(1);

        }

    }
);


// ================= AUTH MODE =================

let authMode = "login";


loginTab.addEventListener("click", () => {

    authMode = "login";

    loginTab.classList.add("active");

    signupTab.classList.remove("active");

    authButtonText.textContent =
        "Login";

    authMessage.textContent = "";
});


signupTab.addEventListener("click", () => {

    authMode = "signup";

    signupTab.classList.add("active");

    loginTab.classList.remove("active");

    authButtonText.textContent =
        "Create Account";

    authMessage.textContent = "";
});


// ================= SIGNUP / LOGIN =================

authForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const email =
            emailInput.value.trim();

        const password =
            passwordInput.value;


        authMessage.textContent =
            "Please wait...";


        if (authMode === "signup") {

            const {
                data,
                error
            } =
                await supabaseClient.auth.signUp({
                    email: email,
                    password: password
                });


            if (error) {

                authMessage.textContent =
                    error.message;

                return;
            }


            if (!data.session) {

                authMessage.textContent =
                    "Account created. Check your email to confirm your account.";

                return;
            }


            authMessage.textContent =
                "Account created successfully.";

        }

        else {

            const { error } =
                await supabaseClient
                    .auth
                    .signInWithPassword({
                        email: email,
                        password: password
                    });


            if (error) {

                authMessage.textContent =
                    error.message;

                return;
            }

        }


        emailInput.value = "";

        passwordInput.value = "";

    }
);


// ================= SESSION =================

async function checkSession() {

    const {
        data
    } =
        await supabaseClient
            .auth
            .getSession();


    if (data.session) {

        showDashboard(
            data.session.user
        );

    }
    else {

        showAuth();

    }
}


function showDashboard(user) {

    authSection.classList.add("hidden");

    dashboardSection.classList.remove("hidden");

    userEmail.textContent =
        user.email;

    loadPhotos();
}


function showAuth() {

    dashboardSection.classList.add("hidden");

    authSection.classList.remove("hidden");

    gallery.innerHTML = "";
}


// Listen for authentication changes

supabaseClient.auth.onAuthStateChange(
    (event, session) => {

        if (session) {

            showDashboard(
                session.user
            );

        }
        else {

            showAuth();

        }

    }
);


// ================= LOGOUT =================

logoutBtn.addEventListener(
    "click",
    async () => {

        const {
            error
        } =
            await supabaseClient
                .auth
                .signOut({
                    scope: "local"
                });


        if (error) {

            alert(error.message);

        }

    }
);


// ================= UPLOAD =================

uploadBtn.addEventListener(
    "click",
    uploadPhotos
);


async function uploadPhotos() {

    const files =
        photoInput.files;


    if (!files.length) {

        uploadMessage.textContent =
            "Please select at least one photo.";

        return;
    }


    const {
        data: { user }
    } =
        await supabaseClient
            .auth
            .getUser();


    if (!user) {

        uploadMessage.textContent =
            "Please login first.";

        return;
    }


    uploadMessage.textContent =
        "Uploading...";


    try {

        for (const file of files) {

            await uploadSinglePhoto(
                file,
                user.id
            );

        }


        uploadMessage.textContent =
            "Photos uploaded successfully.";


        photoInput.value = "";


        loadPhotos();

    }

    catch (error) {

        uploadMessage.textContent =
            "Upload failed: " +
            error.message;

        console.error(error);

    }
}


async function uploadSinglePhoto(
    file,
    userId
) {

    const fileExtension =
        file.name
            .split(".")
            .pop();


    const uniqueFileName =
        Date.now() +
        "-" +
        Math.random()
            .toString(36)
            .substring(2) +
        "." +
        fileExtension;


    const filePath =
        userId +
        "/" +
        uniqueFileName;


    const {
        error: uploadError
    } =
        await supabaseClient
            .storage
            .from(BUCKET_NAME)
            .upload(
                filePath,
                file,
                {
                    contentType: file.type,
                    upsert: false
                }
            );


    if (uploadError) {

        throw uploadError;

    }


    const {
        error: databaseError
    } =
        await supabaseClient
            .from("photos")
            .insert({

                user_id: userId,

                file_name: file.name,

                file_path: filePath,

                file_size: file.size,

                mime_type: file.type

            });


    if (databaseError) {

        await supabaseClient
            .storage
            .from(BUCKET_NAME)
            .remove([filePath]);

        throw databaseError;

    }
}


// ================= LOAD GALLERY =================

async function loadPhotos() {

    previewItems = [];

    gallery.innerHTML =
        "<p>Loading photos...</p>";


    const {
        data: { user }
    } =
        await supabaseClient
            .auth
            .getUser();


    if (!user) {

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("photos")
            .select("*")
            .eq("user_id", user.id)
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        gallery.innerHTML =
            "<p>Could not load photos.</p>";

        console.error(error);

        return;
    }


    photoCount.textContent =
        `${data.length} photo${data.length === 1 ? "" : "s"}`;


    if (!data.length) {

        gallery.innerHTML =
            `<p class="empty-message">
                No photos uploaded yet.
            </p>`;

        return;
    }


    gallery.innerHTML = "";


    for (const photo of data) {

        await createPhotoCard(photo);

    }
}


// ================= PHOTO CARD =================

async function createPhotoCard(photo) {

    const {
        data: imageData,
        error
    } =
        await supabaseClient
            .storage
            .from(BUCKET_NAME)
            .download(
                photo.file_path
            );


    if (error) {

        console.error(error);

        return;

    }


    const imageUrl =
        URL.createObjectURL(imageData);

    previewItems.push({
        imageUrl,
        fileName: photo.file_name,
    });


    const card =
        document.createElement("div");

    card.className =
        "photo-card";


    card.innerHTML = `

        <img
            src="${imageUrl}"
            alt="${escapeHTML(photo.file_name)}"
        >

        <div class="photo-info">

            <div class="photo-name">
                ${escapeHTML(photo.file_name)}
            </div>

            <div class="photo-date">
                ${formatDate(photo.created_at)}
            </div>

            <div class="photo-actions">

                <button
                    class="download-btn"
                    type="button"
                    onclick="downloadPhoto('${photo.file_path}', '${escapeHTML(photo.file_name)}')"
                >
                    Download
                </button>

                <button
                    class="preview-btn"
                    type="button"
                >
                    Preview
                </button>

                <button
                    class="delete-btn"
                    type="button"
                    onclick="deletePhoto('${photo.id}', '${photo.file_path}')"
                >
                    Delete
                </button>

            </div>

        </div>
    `;


    gallery.appendChild(card);

    card
        .querySelector(".preview-btn")
        .addEventListener(
            "click",
            () => openPreview(imageUrl)
        );
}


// ================= DOWNLOAD =================

async function downloadPhoto(
    filePath,
    fileName
) {

    const {
        data,
        error
    } =
        await supabaseClient
            .storage
            .from(BUCKET_NAME)
            .download(filePath);


    if (error) {

        alert(
            "Download failed: " +
            error.message
        );

        return;
    }


    const url =
        URL.createObjectURL(data);


    const link =
        document.createElement("a");


    link.href = url;

    link.download = fileName;


    document.body.appendChild(link);

    link.click();

    link.remove();


    URL.revokeObjectURL(url);
}


// ================= DELETE =================

async function deletePhoto(
    photoId,
    filePath
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this photo?"
        );


    if (!confirmed) {

        return;

    }


    const {
        error: storageError
    } =
        await supabaseClient
            .storage
            .from(BUCKET_NAME)
            .remove([filePath]);


    if (storageError) {

        alert(
            "Could not delete photo: " +
            storageError.message
        );

        return;
    }


    const {
        error: databaseError
    } =
        await supabaseClient
            .from("photos")
            .delete()
            .eq("id", photoId);


    if (databaseError) {

        alert(
            "Photo removed from storage, but database cleanup failed."
        );

        console.error(databaseError);

        return;
    }


    loadPhotos();
}


// ================= REFRESH =================

refreshBtn.addEventListener(
    "click",
    loadPhotos
);


// ================= DATE =================

function formatDate(dateString) {

    const date =
        new Date(dateString);


    return date.toLocaleString(
        "en-IN",
        {
            dateStyle: "medium",
            timeStyle: "short"
        }
    );
}



// ================= SECURITY HELPER =================

function escapeHTML(value) {

    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


// ================= START APPLICATION =================

checkSession();