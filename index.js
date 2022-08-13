const dropZone = document.querySelector(".drop-zone");
const fileInput = document.querySelector("#fileInput");
const browseBtn = document.querySelector(".browseBtn");

const progressContainer = document.querySelector(".progress-container");
const bgProgress = document.querySelector(".bg-progress");
const percentDiv = document.querySelector("#percent");
const progressBar = document.querySelector(".progress-bar");
const sharingContainer = document.querySelector(".sharing-container");
const fileURLInput = document.querySelector("#fileURL");
const copyBtn = document.querySelector("#copyBtn");




const emailForm = document.querySelector("#emailForm");

const toast = document.querySelector(".toast");

const host = "https://filetransferapp.herokuapp.com/";
const uploadURL = `${host}api/files`;
const emailURL = `${host}api/files/send`;

const maxAllowedSize = 100 * 1024 *1024 ;

dropZone.addEventListener("dragover", (e) =>{
    e.preventDefault();
    console.log("dragging");
    if(!dropZone.classList.contains("dragged")){
    dropZone.classList.add("dragged");
    }  
})

dropZone.addEventListener("dragleave", ()=>{
    dropZone.classList.remove("dragged");
})
dropZone.addEventListener("drop", (e)=>{
    e.preventDefault();
    dropZone.classList.remove("dragged");
    const files = e.dataTransfer.files;
    console.table(files);
    if(files.length){
    fileInput.files = files;
    uploadFile();
    }
    
})

fileInput.addEventListener("change", () =>{
    uploadFile();
})

browseBtn.addEventListener("click", ()=>{ 
    fileInput.click();
})

copyBtn.addEventListener("click", () =>{
    fileURLInput.select()
    document.execCommand("copy");
    showToast("Link Copied");

});
const uploadFile = () => {
    if (fileInput.files.length > 1){
        resetFileInput();
        showToast("Upload 1 file only!");
        return;
    }
    const file = fileInput.files[0];

    if(file.size > maxAllowedSize){
        showToast("Can't upload more 100 MB");
        resetFileInput();
        return;
    }


    progressContainer.style.display = "block";
    
    const formData = new FormData();
    formData.append("myfile", file);

    const xhr = new XMLHttpRequest();
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response));
        }
        // if (this.readyState == 4 && this.status == 200) {
        //    // Typical action to be performed when the document is ready:
        //    document.getElementById("demo").innerHTML = xhttp.responseText;
    };

    xhr.upload.onprogress = updateProgress;

    xhr.upload.onerror = () =>{
        showToast(`Error in upload: ${xhr.statusText}`);
    }

    xhr.open("POST", uploadURL);
    xhr.send(formData);
}

    const updateProgress = (e) =>{
        const percent = Math.round((e.loaded / e.total) * 100);
        // console.log(percent);
        bgProgress.style.width = `${percent}%`;
        percentDiv.innerText = percent;
        progressBar.style.transform = `scaleX(${percent/ 100} )`;
    }

    const onUploadSuccess = ({file: url}) =>{
        console.log(url);
        resetFileInput();
        emailForm[2].removeAttribute("disabled");
        progressContainer.style.display = "none";
        sharingContainer.style.display = "block";
        fileURLInput.value = url;

    }

    const resetFileInput = () =>{
        fileInput.value = "";

    }

    emailForm.addEventListener("submit", (e) => {
        e.preventDefault();
        console.log("Submit Form");
        const url = fileURLInput.value;

        const formData = {
            uuid: url.split("/").splice(-1, 1)[0],
            emailTo: emailForm.elements["to-email"].value,
            emailFrom: emailForm.elements["from-email"].value,

        };
        emailForm[2].setAttribute("disabled", "true");

        console.table(formData);
        
        fetch(emailURL, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(formData),
        })
            .then((res) => res.json())
            .then(({success}) => {
                if(success){
                    sharingContainer.style.display = "none";
                    showToast("Email Sent");
                }
            
            });

    });

    let toastTimer;
    const showToast = (msg) =>{
        toast.innerText = msg;
        toast.style.transform = "translate(-50%, 0)";
        clearTimeout(toastTimer);
        toastTimer = setTimeout( () =>{
            toast.style.transform = "translate(-50%, 60px)";
        }, 2000);
    };



