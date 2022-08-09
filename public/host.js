// configuration = {
//     iceServers: [{
//         urls: "stun:stun.stunprotocol.org"
//     }]
// };


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

const ws = new WebSocket('ws://192.168.5.59:8080');
const peerConnections = [];

const lasticecandidate = (id) => {
    const offer = peerConnections[id].localDescription;
    // fetch('http://localhost:3000/connections/', {
    //     headers: {
    //         'Content-Type': 'application/json'
    //     },
    //     method: 'POST',
    //     body: JSON.stringify(offer),
    // })
    console.log({ id, offer })
    ws.send(JSON.stringify({ id, offer }))
}

// peerConnection.onicecandidate = handleicecandidate(lasticecandidate);
// peerConnection.onconnectionstatechange = handleconnectionstatechange;
// peerConnection.oniceconnectionstatechange = handleiceconnectionstatechange;
var audioInputs = [];
var videoInputs = [];
var audioInputSelect = document.querySelector('select#audio-input');
var videoInputSelect = document.querySelector('select#video-input');
var stream;


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

const createOffer = (params) => {
    const ids = params.ids;
    console.log(ids)

    for (const id of ids) {
        if (!(id in peerConnections)) {
            const peerConnection = new RTCPeerConnection();
            peerConnections[id] = peerConnection;
            peerConnections[id].onicecandidate = function (event) {
                if (event.candidate != null) {
                    console.log('new ice candidate');
                } else {
                    console.log('all ice candidates');
                    lasticecandidate(id);
                }
            };
            peerConnection.onconnectionstatechange = handleconnectionstatechange;
            peerConnection.oniceconnectionstatechange = handleiceconnectionstatechange;
            peerConnections[id].createDataChannel('dataChannel')
            stream.getTracks().forEach(track => peerConnection.addTrack(
                track,
                stream,
            ));

            const createOfferPromise = peerConnections[id].createOffer();
            createOfferPromise.then((offer) => {
                setLocalPromise = peerConnections[id].setLocalDescription(offer);
                setLocalPromise.then(() => {
                    console.log('setLocalDone')
                }, () => {
                    console.log('setLocalFailed')
                });

            });
        }
    }
}

const connect = ({ id, answer }) => {
    const setRemotePromise = peerConnections[id].setRemoteDescription(answer);
    setRemotePromise.then(() => {
        console.log('setRemoteDone for ' + id);
    }, () => {
        console.log('setRemoteFailed for ' + id);
    });
}

const actions = {
    'createOffer': createOffer,
    'answer': connect,
}

const wsMessage = (event) => {
    const msg = JSON.parse(event.data);
    const action = msg.action;
    console.log(msg)
    console.log(action)
    if (action === 'createOffer') {
        createOffer(msg.params);
    } else if (action === 'answer') {
        connect(msg.params);
    }
}

const setup = () => {
    const audioId = audioInputSelect.value;
    const videoId = videoInputSelect.value;
    navigator.mediaDevices.getUserMedia({
        audio: { deviceId: audioId },
        video: { deviceId: videoId },
    }).then(newStream => {
        stream = newStream


        ws.send('master')
        ws.onmessage = wsMessage

        // setInterval(async () => {
        //     await getAllPendingOffers()
        //     // sendmsg('hello')
        // }, 4000)
        // clickcreateoffer()
    }).catch(err => {
        console.log(err);
    });

}

// var dataChannel;

// const createOfferDone = (offer) => {
//     setLocalPromise = peerConnection.setLocalDescription(offer);
//     setLocalPromise.then(() => {
//         console.log('setLocalDone')
//     }, () => {
//         console.log('setLocalFailed')
//     });
// }

// function datachannelopen() {
//     console.log('datachannelopen');
// }

// function datachannelmessage(message) {
//     console.log('datachannelmessage');
//     console.log(message);
// }


// function clickcreateoffer() {
//     dataChannel = peerConnection.createDataChannel('dataChannel');
//     dataChannel.onopen = datachannelopen;
//     // dataChannel.onmessage = datachannelmessage;

//     const createOfferPromise = peerConnection.createOffer();
//     createOfferPromise.then(createOfferDone);
// }

// function sendmsg(text) {
//     dataChannel.send(text);
// }


// const getAllPendingOffers = async () => {
//     await fetch('http://localhost:3000/remote-descriptions', {
//         method: 'GET',
//     })
//         .then(response => response.json())
//         .then(data => {
//             data.forEach(offer => {
//                 console.log(offer)
//                 connect(offer);
//             })
//         })
// }


window.onload = () => {
    document.querySelector('button#setup').onclick = setup;
};
