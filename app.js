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

const selectedPhotoCount =
    document.getElementById("selectedPhotoCount");

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
const previewVideo = document.getElementById("previewVideo");
const previewFileName = document.getElementById("previewFileName");
const previewPosition = document.getElementById("previewPosition");
const closePreviewBtn = document.getElementById("closePreviewBtn");
const previousPreviewBtn = document.getElementById("previousPreviewBtn");
const nextPreviewBtn = document.getElementById("nextPreviewBtn");
let previewTrigger = null;
let previewItems = [];
let currentPreviewIndex = 0;

photoInput.addEventListener(
    "change",
    () => {

        const count = photoInput.files.length;

        selectedPhotoCount.textContent = count
            ? `${count} item${count === 1 ? "" : "s"} selected`
            : "Choose photos and videos";

    }
);

function showPreviewAt(index) {

    if (index < 0 || index >= previewItems.length) {

        return;

    }

    currentPreviewIndex = index;

    const preview = previewItems[currentPreviewIndex];

    previewVideo.pause();
    previewVideo.removeAttribute("src");
    previewVideo.load();

    if (preview.isVideo) {

        previewImage.classList.add("hidden");
        previewVideo.classList.remove("hidden");
        previewVideo.src = preview.mediaUrl;

    } else {

        previewVideo.classList.add("hidden");
        previewImage.classList.remove("hidden");
        previewImage.src = preview.mediaUrl;

    }

    previewFileName.textContent = preview.fileName;

    previewPosition.textContent =
        `${currentPreviewIndex + 1} / ${previewItems.length}`;

    const navigationDisabled = previewItems.length < 2;

    previousPreviewBtn.disabled = navigationDisabled;

    nextPreviewBtn.disabled = navigationDisabled;

    previewModal.classList.remove("hidden");

}


function openPreview(mediaUrl) {

    previewTrigger = document.activeElement;

    const index = previewItems.findIndex(
        (preview) => preview.mediaUrl === mediaUrl
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
    previewVideo.pause();
    previewVideo.removeAttribute("src");
    previewVideo.load();

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
            "Please select at least one photo or video.";

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
            "Photos and videos uploaded successfully.";


        photoInput.value = "";
        selectedPhotoCount.textContent =
            "Choose photos and videos";


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
        `${data.length} item${data.length === 1 ? "" : "s"}`;


    if (!data.length) {

        gallery.innerHTML =
            `<p class="empty-message">
                No photos or videos uploaded yet.
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

    const isVideo =
        photo.mime_type?.startsWith("video/") ||
        /\.(mp4|webm|og[gv]|mov)$/i.test(photo.file_name);

    let mediaUrl;
    let imageUrl;
    let error;

    if (isVideo) {

        const result =
            await supabaseClient
                .storage
                .from(BUCKET_NAME)
                .createSignedUrl(
                    photo.file_path,
                    3600
                );

        mediaUrl = result.data?.signedUrl;
        error = result.error;

    } else {

        const result =
            await supabaseClient
                .storage
                .from(BUCKET_NAME)
                .download(
                    photo.file_path
                );

        error = result.error;

        if (!error) {

            imageUrl =
                URL.createObjectURL(result.data);
            mediaUrl = imageUrl;

        }

    }

    if (error) {

        console.error(error);

        const card =
            document.createElement("div");

        card.className =
            "photo-card photo-card-unavailable";

        const placeholder =
            document.createElement("div");

        placeholder.className =
            "photo-unavailable-art";

        placeholder.setAttribute("role", "status");
        placeholder.textContent =
            isVideo ? "Video unavailable" : "Image unavailable";

        const info =
            document.createElement("div");

        info.className =
            "photo-unavailable-info";

        const name =
            document.createElement("div");

        name.className =
            "photo-name";
        name.textContent = photo.file_name;

        const date =
            document.createElement("div");

        date.className =
            "photo-date";
        date.textContent = formatDate(photo.created_at);

        const message =
            document.createElement("p");

        message.className =
            "photo-unavailable-message";
        message.textContent =
            `Could not retrieve this ${isVideo ? "video" : "image"} from the photos bucket. Refresh, then verify that the file exists at its saved storage path.`;

        const actions =
            document.createElement("div");

        actions.className =
            "photo-actions";

        const deleteButton =
            document.createElement("button");

        deleteButton.className =
            "delete-btn";
        deleteButton.type = "button";
        deleteButton.setAttribute(
            "aria-label",
            "Remove from vault"
        );
        deleteButton.title =
            "Remove from vault";
        deleteButton.innerHTML = `
            <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                <path d="M13 4H8.8C7.11984 4 6.27976 4 5.63803 4.32698C5.07354 4.6146 4.6146 5.07354 4.32698 5.63803C4 6.27976 4 7.11984 4 8.8V15.2C4 16.8802 4 17.7202 4.32698 18.362C4.6146 18.9265 5.07354 19.3854 5.63803 19.673C6.27976 20 7.11984 20 8.8 20H15.2C16.8802 20 17.7202 20 18.362 19.673C18.9265 19.3854 19.3854 18.9265 19.673 18.362C20 17.7202 20 16.8802 20 15.2V11" stroke="#D7FB89" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M4 16L8.29289 11.7071C8.68342 11.3166 9.31658 11.3166 9.70711 11.7071L13 15M13 15L15.7929 12.2071C16.1834 11.8166 16.8166 11.8166 17.2071 12.2071L20 15M13 15L15.25 17.25" stroke="#D7FB89" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                <path d="M17 3L19 5M21 7L19 5M19 5L21 3M19 5L17 7" stroke="#D7FB89" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
        `;
        deleteButton.addEventListener(
            "click",
            () => deletePhoto(photo.id, photo.file_path, true)
        );

        actions.appendChild(deleteButton);
        info.append(name, date, message, actions);
        card.append(placeholder, info);
        gallery.appendChild(card);

        return;

    }


    const card =
        document.createElement("div");

    card.className =
        "photo-card";

    const media =
        document.createElement(isVideo ? "video" : "img");

    media.src = mediaUrl;

    if (isVideo) {

        media.controls = true;
        media.playsInline = true;
        media.preload = "metadata";

    }

    previewItems.push({
        mediaUrl,
        fileName: photo.file_name,
        isVideo,
    });

    if (!isVideo) {
        media.alt = photo.file_name;
        media.tabIndex = 0;
        media.setAttribute("role", "button");
        media.setAttribute(
            "aria-label",
            `View ${photo.file_name}`
        );
    }

    card.innerHTML = `
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
                    aria-label="Download ${escapeHTML(photo.file_name)}"
                    title="Download"
                    onclick="downloadPhoto('${photo.file_path}', '${escapeHTML(photo.file_name)}')"
                >
                    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                        <path fill-rule="evenodd" clip-rule="evenodd" d="M8 10C8 7.79086 9.79086 6 12 6C14.2091 6 16 7.79086 16 10V11H17C18.933 11 20.5 12.567 20.5 14.5C20.5 16.433 18.933 18 17 18H16.9C16.3477 18 15.9 18.4477 15.9 19C15.9 19.5523 16.3477 20 16.9 20H17C20.0376 20 22.5 17.5376 22.5 14.5C22.5 11.7793 20.5245 9.51997 17.9296 9.07824C17.4862 6.20213 15.0003 4 12 4C8.99974 4 6.51381 6.20213 6.07036 9.07824C3.47551 9.51997 1.5 11.7793 1.5 14.5C1.5 17.5376 3.96243 20 7 20H7.1C7.65228 20 8.1 19.5523 8.1 19C8.1 18.4477 7.65228 18 7.1 18H7C5.067 18 3.5 16.433 3.5 14.5C3.5 12.567 5.067 11 7 11H8V10ZM13 11C13 10.4477 12.5523 10 12 10C11.4477 10 11 10.4477 11 11V16.5858L9.70711 15.2929C9.31658 14.9024 8.68342 14.9024 8.29289 15.2929C7.90237 15.6834 7.90237 16.3166 8.29289 16.7071L11.2929 19.7071C11.6834 20.0976 12.3166 20.0976 12.7071 19.7071L15.7071 16.7071C16.0976 16.3166 16.0976 15.6834 15.7071 15.2929C15.3166 14.9024 14.6834 14.9024 14.2929 15.2929L13 16.5858V11Z" fill="#212220" />
                    </svg>
                </button>

                ${isVideo ? `<button
                    class="preview-btn"
                    type="button"
                >
                    Preview
                </button>` : ""}

                <button
                    class="delete-btn"
                    type="button"
                    aria-label="Delete ${escapeHTML(photo.file_name)}"
                    title="Delete"
                    onclick="deletePhoto('${photo.id}', '${photo.file_path}')"
                >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
                        <path d="M13 4H8.8C7.11984 4 6.27976 4 5.63803 4.32698C5.07354 4.6146 4.6146 5.07354 4.32698 5.63803C4 6.27976 4 7.11984 4 8.8V15.2C4 16.8802 4 17.7202 4.32698 18.362C4.6146 18.9265 5.07354 19.3854 5.63803 19.673C6.27976 20 7.11984 20 8.8 20H15.2C16.8802 20 17.7202 20 18.362 19.673C18.9265 19.3854 19.3854 18.9265 19.673 18.362C20 17.7202 20 16.8802 20 15.2V11" stroke="#D7FB89" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M4 16L8.29289 11.7071C8.68342 11.3166 9.31658 11.3166 9.70711 11.7071L13 15M13 15L15.7929 12.2071C16.1834 11.8166 16.8166 11.8166 17.2071 12.2071L20 15M13 15L15.25 17.25" stroke="#D7FB89" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                        <path d="M17 3L19 5M21 7L19 5M19 5L21 3M19 5L17 7" stroke="#D7FB89" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
                    </svg>
                </button>

            </div>

        </div>
    `;

    card.prepend(media);

    gallery.appendChild(card);

    if (isVideo) {

        card
            .querySelector(".preview-btn")
            .addEventListener(
                "click",
                () => openPreview(mediaUrl)
            );

    } else {

        media.addEventListener(
            "click",
            () => openPreview(mediaUrl)
        );

        media.addEventListener(
            "keydown",
            (event) => {

                if (event.key === "Enter" || event.key === " ") {

                    event.preventDefault();
                    openPreview(mediaUrl);

                }

            }
        );

    }
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
    filePath,
    removeRecordIfStorageCleanupFails = false
) {

    const confirmed =
        confirm(
            removeRecordIfStorageCleanupFails
                ? "Remove this unavailable photo from your vault? If storage cleanup also fails, its database record will still be removed."
                : "Are you sure you want to delete this photo?"
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


    if (storageError && !removeRecordIfStorageCleanupFails) {

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
            storageError
                ? "Could not remove the photo record. Storage cleanup also failed."
                : "Photo removed from storage, but database cleanup failed."
        );

        console.error(databaseError);

        if (storageError) {

            console.error(storageError);

        }

        return;

    }

    if (storageError) {

        console.error(storageError);

        alert(
            "Photo removed from your vault, but storage cleanup failed. The file may still exist in the photos bucket."
        );

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