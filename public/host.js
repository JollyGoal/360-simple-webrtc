// configuration = {
//     iceServers: [{
//         urls: "stun:stun.stunprotocol.org"
//     }]
// };

const peerConnection = new RTCPeerConnection();

function handleicecandidate(lasticecandidate) {
    return function (event) {
        if (event.candidate != null) {
            console.log('new ice candidate');
        } else {
            console.log('all ice candidates');
            lasticecandidate();
        }
    }
}

function handleconnectionstatechange(event) {
    console.log('handleconnectionstatechange');
    console.log(event);
}

function handleiceconnectionstatechange(event) {
    console.log('ice connection state: ' + event.target.iceConnectionState);
}

const lasticecandidate = () => {
    offer = peerConnection.localDescription;
    fetch('http://localhost:3000/connections/', {
        headers: {
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(offer),
    })
}

peerConnection.onicecandidate = handleicecandidate(lasticecandidate);
peerConnection.onconnectionstatechange = handleconnectionstatechange;
peerConnection.oniceconnectionstatechange = handleiceconnectionstatechange;
var audioInputs = [];
var videoInputs = [];
var audioInputSelect = document.querySelector('select#audio-input');
var videoInputSelect = document.querySelector('select#video-input');


const drawInputsSelects = () => {
    audioInputSelect = document.querySelector('select#audio-input');
    videoInputSelect = document.querySelector('select#video-input');
    audioInputs.forEach(audioInput => {
        const option = document.createElement('option');
        option.value = audioInput.deviceId;
        option.text = audioInput.label;
        audioInputSelect.appendChild(option);
    })

    videoInputs.forEach(videoInput => {
        const option = document.createElement('option');
        option.value = videoInput.deviceId;
        option.text = videoInput.label;
        videoInputSelect.appendChild(option);
    })
}

navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
    navigator.mediaDevices.enumerateDevices().then(devices => {
        devices.forEach(device => {
            if (device.kind === 'audioinput') {
                audioInputs.push(device);
            } else if (device.kind === 'videoinput') {
                videoInputs.push(device);
            }
        });
        drawInputsSelects();
    });
})

const setup = () => {
    const audioId = audioInputSelect.value;
    const videoId = videoInputSelect.value;
    const stream = navigator.mediaDevices.getUserMedia({
        audio: { deviceId: audioId },
        video: { deviceId: videoId },
    }).then(stream => {
        stream.getTracks().forEach(track => peerConnection.addTrack(
            track,
            stream,
        ));
        console.log(peerConnection.getSenders());
        console.log(stream.getTracks());
        setInterval(async () => {
            await getAllPendingOffers()
            // sendmsg('hello')
        }, 4000)
        clickcreateoffer()
    }).catch(err => {
        console.log(err);
    });

}

var dataChannel;

const createOfferDone = (offer) => {
    setLocalPromise = peerConnection.setLocalDescription(offer);
    setLocalPromise.then(() => {
        console.log('setLocalDone')
    }, () => {
        console.log('setLocalFailed')
    });

}

function datachannelopen() {
    console.log('datachannelopen');
}

// function datachannelmessage(message) {
//     console.log('datachannelmessage');
//     console.log(message);
// }


function clickcreateoffer() {
    dataChannel = peerConnection.createDataChannel('dataChannel');
    dataChannel.onopen = datachannelopen;
    // dataChannel.onmessage = datachannelmessage;

    const createOfferPromise = peerConnection.createOffer();
    createOfferPromise.then(createOfferDone);
}

function sendmsg(text) {
    dataChannel.send(text);
}


const connect = (answer) => {
    const setRemotePromise = peerConnection.setRemoteDescription(answer);
    setRemotePromise.then(() => {
        console.log('setRemoteDone')
    }, () => {
        console.log('setRemoteFailed')
    });
}


const getAllPendingOffers = async () => {
    await fetch('http://localhost:3000/remote-descriptions', {
        method: 'GET',
    })
        .then(response => response.json())
        .then(data => {
            data.forEach(offer => {
                console.log(offer)
                connect(offer);
            })
        })
}


window.onload = () => {
    document.querySelector('button#setup').onclick = setup;
};
