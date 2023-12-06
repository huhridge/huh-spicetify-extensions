// @ts-check
// NAME: Full App Display
// AUTHOR: khanhas
// VERSION: 1.2
// DESCRIPTION: Fancy artwork and track status display.

/// <reference path="../globals.d.ts" />

(function FullAppDisplay() {
    if (!Spicetify.Keyboard || !Spicetify.React || !Spicetify.ReactDOM || !Spicetify.Platform) {
        setTimeout(FullAppDisplay, 200);
        return;
    }

    const { React: react, ReactDOM: reactDOM } = Spicetify;
    const { useState, useEffect } = react;

    const CONFIG = getConfig();

    if (
        !CONFIG["colorChoice"] ||
        CONFIG["colorChoice"] == "colorDark" ||
        CONFIG["colorChoice"] == "colorLight" ||
        CONFIG["colorChoice"] == "colorRaw"
    ) {
        CONFIG["colorChoice"] = "LIGHT_VIBRANT";
        saveConfig();
    }

    if (!CONFIG["version"]) {
        CONFIG["version"] = "1.2";
        saveConfig();
    }

    let updateVisual;
    let nextUri, prevColor, nextColor, finImage;
    let isHidden = false;
    let time;

    const style = document.createElement("style");
    const styleBase = `
#full-app-display {
    display: none;
    position: fixed;
    width: 100%;
    height: 100%;
    cursor: default;
    left: 0;
    top: 0;
}
#fad-header {
    position: fixed;
    width: 100%;
    height: 80px;
    -webkit-app-region: drag;
}
#fad-body {
    height: 100vh;
}
#fad-foreground {
    position: relative;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transform: scale(var(--fad-scale));
    transition: all 1s ease;
}
#fad-art-image {
    position: relative;
    width: 100%;
    height: 100%;
    padding-bottom: 100%;
    border-radius: 15px;
    background-size: cover;
}
#fad-art-inner {
    position: absolute;
    left: 3%;
    bottom: 0;
    width: 94%;
    height: 94%;
    z-index: -1;
    backface-visibility: hidden;
    transform: translateZ(0);
    filter: blur(6px);
    backdrop-filter: blur(6px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6) !important;
}
#fad-progress-container {
    width: 100%;
    display: flex;
    align-items: center;
}
#fad-progress {
    width: 100%;
    height: 6px;
    margin: 6px 0 6px;
    border-radius: 6px;
    background-color: #ffffff50;
    overflow: hidden;
}
#fad-progress-inner {
    height: 100%;
    transition: width 100ms ease;
    border-radius: 6px;
    background-color: #ffffff;
    box-shadow: 4px 0 12px rgba(0, 0, 0, 0.8) !important;
}
#fad-volume {
    width: 4rem;
    height: 16rem;
    position: fixed;
    left: 1rem;
    transition: opacity ease 350ms;
}
#fad-volume:hover {
    opacity: 1 !important;
}
#fad-volicon {
    height: fit-content;
    display: grid;
    justify-content: start;
}
#fad-volbar {
    display: flex;
    height: 200px;
    width: 8px;
    border-radius: 6px;
    overflow: hidden;
    background-color: #ffffff50;
    justify-content: center;
    padding-top: 10px;
    align-items: end;
    margin-left: 27.5px;
    margin-top: 10px;
    position: absolute;
}
#fad-volbar-inner {
    width: 8px;
    border-radius: 6px;
    background-color: rgb(255, 255, 255);
    transition: height 0.5s ease 0s;
}
#fad-duration {
    margin-left: 10px;
}
#fad-background {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: -2;
}
body.fad-activated #full-app-display {
    display: block
}
.fad-background-fade {
    transition: background-image 1s linear;
}
body.video-full-screen.video-full-screen--hide-ui {
    cursor: auto;
}
#fad-controls button, #fad-extracontrols button {
    background-color: transparent;
    border: 0;
    color: currentColor;
    padding: 0 5px;
    pointer-events: auto;
}
#fad-controls button:hover, #fad-extracontrols button:hover, #fad-volicon button:hover{
    transform: scale(1.1);
}
#fad-artist svg, #fad-album svg {
    display: inline-block;
}
#fad-upnext {
    position: absolute;
    width: 399px;
    height: 90px;
    display: flex;
    border-radius: 10px;
    animation: textchange 0.5s forwards;
    transition: clip-path 0.4s;
}
#fad-upnext-image {
    width: 64px;
    align-self: center;
    margin-left: 13px;
    height: 64px;
    background-size: cover;
    background-position: center;
    border-radius: 5px;
    box-shadow: 0 4px 8px rgb(0 0 0 / 30%) !important;
    z-index: 0;
}
#fad-upnext-blur {
    position: absolute;
    backdrop-filter: blur(15px) brightness(0.6);
    background-color: rgb(255,255,255,0.1);
    width: 100%;
    height: 100%;
    border-radius: 10px;
}
#fad-upnext-details{
    margin-left: 15px;
    align-self: center;
    font-size: 14.5px;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    color: #ffffff;
    overflow: hidden;
    white-space: nowrap;
}
#scroll-queue{
    position: absolute;
    width: 399px;
    height: 90px;
    color: transparent;
    z-index: 2;
}
.dont-scale{
    transform: scale(calc(1/(var(--fad-scale))));
}
.dot-after:after{
    background-color: currentColor;
    border-radius: 50%;
    bottom: 3px;
    content: "";
    display: block;
    height: 4px;
    left: 50%;
    position: relative;
    transform: translateX(-50%);
    width: 4px;
}
.crossed-out:after{
    background-color: currentColor;
    bottom: 24px;
    transform: rotate(45deg);
    transform-origin: 0 0;
    content: "";
    display: block;
    height: 27px;
    left: 18px;
    position: relative;
    width: 0.5px;
}
::-webkit-scrollbar {
    width: 8px;
}

.fad-grad-image{
    position: absolute;
    filter: blur(40px) brightness(0.60);
    border-radius: 100em;
    animation: rotategrad 50s linear infinite 1s;
}

@keyframes textchange {
    0%{
        opacity: 0;
    }   
    30%{
        opacity: 0.3;
    }
    60%{
        opacity: 0.6;
    }
    90%{
        opacity: 0.9;
    }
  }

@keyframes rotategrad {
    0% {
        transform: rotate(18deg);
    }
    100% {
        transform: rotate(378deg);
    }
}
`;

    const styleChoices = [
        `
#fad-foreground {
    flex-direction: row;
    text-align: left;
}
#fad-art {
    width: calc(100vw - 840px);
    min-width: 200px;
    max-width: 340px;
}
#fad-details {
    padding-left: 40px;
    line-height: initial;
    max-width: 70%;
    color: #FFFFFF;
    filter: invert(0);
}
#fad-title {
    font-size: 87px;
    font-weight: 900;
}
#fad-artist, #fad-album {
    font-size: 54px;
    font-weight: 400;
}
#fad-artist svg, #fad-album svg {
    margin-right: 5px;
}
#fad-status {
    display: flex;
    min-width: 400px;
    max-width: 400px;
    align-items: center;
}
#fad-status.active {
    margin-top: 20px;
}
#fad-controls {
    display: flex;
    margin-right: 10px;
    z-index: 0;
}
#fad-extracontrols {
    height: 28px;
    display: flex;
}
#fad-elapsed {
    min-width: 52px;
}`,
        `
#fad-art {
    width: calc(100vh - 400px);
    max-width: 340px;
}
#fad-foreground {
    flex-direction: column;
    text-align: center;
}
#fad-details {
    padding-top: 40px;
    line-height: initial;
    max-width: 70%;
    color: #FFFFFF;
    filter: invert(0);
}
#fad-title {
    line-height: 1;
    font-size: 54px;
    font-weight: 900;
}
#fad-artist, #fad-album {
    font-size: 33px;
    font-weight: 400;
}
#fad-artist svg, #fad-album svg {
    width: 25px;
    height: 25px;
    margin-right: 5px;
}
#fad-status {
    display: flex;
    min-width: 400px;
    max-width: 400px;
    align-items: center;
    flex-direction: column;
}
#fad-status.active {
    margin: 20px auto 0;
}
#fad-controls {
    margin-top: 20px;
    order: 2;
    z-index: 0;
}
#fad-extracontrols {
    order: 3;
    width: 100%;
    height: 28px;
    display: flex;
}
#fad-elapsed {
    min-width: 56px;
    margin-right: 10px;
    text-align: right;
}`,
    ];

    const lyricsPlusBase = `
#fad-body {
    display: grid;
    grid-template-columns: 1fr 1fr;
}
#fad-foreground {
    padding: 0 50px 0 100px;
    width: 50vw;
}
#fad-lyrics-plus-container {
    position: relative;
    width: 50vw;
}
.lyrics-lyricsContainer-LyricsContainer.fad-enabled .lyrics-config-button-container {
    display: none;
}
`;
    const lyricsPlusStyleChoices = [
        `
#fad-title {
    font-size: 4vw;
}
#fad-artist, #fad-album {
    font-size: 2.5vw;
    font-weight: 400;
}
#fad-art {
    max-width: 210px;
    margin-left: 50px;
}`,
        `
#fad-title {
    font-size: 3.9vw;
}
#fad-artist, #fad-album {
    font-size: 2.5vw;
    font-weight: 400;
}
        `,
    ];

    const verticalMonitorStyle = [
        `
#fad-body {
    grid-template-columns: none;
}
#fad-foreground, #fad-lyrics-plus-container {
    width: 100%;
    height: 50vh;
}
#fad-foreground {
    padding: 0 50px 0;
}
.lyrics-lyricsContainer-LyricsContainer.fad-enabled {
    height: 50vh;
    --lyrics-align-text: center !important;
}
#fad-volume {
    top: 15vh;
}
        `,
    ];
    updateStyle();

    function displayUpdate() {
        let updateText = react.createElement(
            "p",
            {
                className: "fad-update",
            },
            `
             This update brings:
             `,
            react.createElement("li", {}, "Added seekable progress bar: Now you can seek songs from FAD itself, click on it to seek!"),
            react.createElement("li", {}, "Added show only on hover mode for volume bar (change in settings)"),
            react.createElement("li", {}, "Bug Fixes: Reworked the upnext and queue function, to account for the scale.")
        );
        Spicetify.PopupModal.display({
            title: "What's New with FullAppDisplayMod",
            content: updateText,
            isLarge: true,
        });
    }

    if (CONFIG["version"] == "1.1") {
        displayUpdate();
        CONFIG["version"] = "1.2";
        saveConfig();
    }

    async function fetchColors(uri) {
        let colors = {};

        try {
            const body = await Spicetify.CosmosAsync.get(`wg://colorextractor/v1/extract-presets?uri=${uri}&format=json`);
            for (const color of body.entries[0].color_swatches) {
                colors[color.preset] = `#${color.color.toString(16).padStart(6, "0")}`;
            }
        } catch {
            colors = {
                DARK_VIBRANT: "#000000",
                DESATURATED: "#000000",
                LIGHT_VIBRANT: "#000000",
                PROMINENT: "#000000",
                VIBRANT: "#000000",
                VIBRANT_NON_ALARMING: "#000000",
            };
        }
        return colors;
    }

    function lightnessColor(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        let r = parseInt(result[1], 16);
        let g = parseInt(result[2], 16);
        let b = parseInt(result[3], 16);
        return (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
    }

    const DisplayIcon = ({ icon, size }) => {
        return react.createElement("svg", {
            width: size,
            height: size,
            viewBox: "0 0 16 16",
            fill: "currentColor",
            dangerouslySetInnerHTML: {
                __html: icon,
            },
        });
    };

    const SubInfo = ({ text, id, icon }) => {
        return react.createElement(
            "div",
            {
                id,
            },
            CONFIG.icons && react.createElement(DisplayIcon, { icon, size: 35 }),
            react.createElement("span", null, text)
        );
    };

    const ButtonIcon = ({ icon, onClick, className = null, style = null, onMouseEnter = null, onMouseLeave = null }) => {
        return react.createElement(
            "button",
            {
                className,
                style,
                onClick,
                onMouseEnter,
                onMouseLeave,
            },
            react.createElement(DisplayIcon, { icon, size: 20 })
        );
    };

    const ProgressBar = () => {
        const [value, setValue] = useState(Spicetify.Player.getProgress());
        useEffect(() => {
            const update = ({ data }) => {
                setValue(data);
            };
            Spicetify.Player.addEventListener("onprogress", update);
            // @ts-ignore
            return () => Spicetify.Player.removeEventListener("onprogress", update);
        });
        const duration = Spicetify.Platform.PlayerAPI._state.duration;
        return react.createElement(
            "div",
            { id: "fad-progress-container" },
            react.createElement("span", { id: "fad-elapsed" }, Spicetify.Player.formatTime(value)),
            react.createElement(
                "div",
                {
                    id: "fad-progress",
                    onClick: (e) => {
                        e.persist();
                        console.log(e);
                        let coors = document.querySelector("#fad-progress").getBoundingClientRect();
                        let temp = (e.pageX - coors.x) / coors.width;
                        console.log(temp);
                        Spicetify.Player.seek(temp);
                        setTimeout(console.log(Spicetify.Player.getProgressPercent()), 200);
                        document.querySelector("#fad-progress-inner").style.width = `${temp}%`;
                    },
                },
                react.createElement("div", {
                    id: "fad-progress-inner",
                    style: {
                        width: (value / duration) * 100 + "%",
                    },
                })
            ),
            react.createElement("span", { id: "fad-duration" }, Spicetify.Player.formatTime(duration))
        );
    };

    // @ts-ignore
    const VolumeBar = () => {
        // @ts-ignore
        const [value, setValue] = useState(Spicetify.Platform.PlaybackAPI._volume);
        let isHover = false;
        if (CONFIG["volumeBar"] == "onlyHover") {
            isHover = true;
        }
        useEffect(() => {
            const update = ({ data }) => {
                setValue(data.volume);
            };
            Spicetify.Platform.PlaybackAPI._events.addListener("volume", update);
            return () => Spicetify.Platform.PlaybackAPI._events.removeListener("volume", update);
        });
        return react.createElement(
            "div",
            {
                id: "fad-volume",
                style: {
                    top: `${(window.innerHeight - 256) / 2}px`,
                    opacity: isHover ? 0 : 1,
                },
                onWheel: (event) => {
                    let dir = event.deltaY < 0 ? 1 : -1;
                    let temp = parseInt(document.querySelector("#fad-volbar-inner").style.height) / 2 + dir * 1;
                    if (temp < 0) {
                        temp = 0;
                    } else if (temp > 100) {
                        temp = 100;
                    }
                    Spicetify.Player.setVolume(temp / 100);
                    document.querySelector("#fad-volbar-inner").style.height = `${2 * temp}px`;
                },
            },
            react.createElement(
                "div",
                { id: "fad-volicon" },
                react.createElement(ButtonIcon, {
                    style: {
                        marginLeft: "18px",
                        backgroundColor: "transparent",
                        border: "0",
                        color: "white",
                        padding: "0 5px",
                        pointerEvents: "auto",
                    },
                    // @ts-ignore
                    icon: Spicetify.Player.getMute() ? Spicetify.SVGIcons["volume-off"] : Spicetify.SVGIcons["volume"],
                    onClick: () => {
                        if (!Spicetify.Player.getMute()) {
                            document.querySelector("#fad-volicon svg").innerHTML = Spicetify.SVGIcons["volume-off"];
                            document.querySelector("#fad-volbar-inner").style.height = `0px`;
                            Spicetify.Player.toggleMute();
                        } else {
                            Spicetify.Player.toggleMute();
                            document.querySelector("#fad-volicon svg").innerHTML = Spicetify.SVGIcons["volume"];
                            setTimeout(() => {
                                document.querySelector("#fad-volbar-inner").style.height = `${Spicetify.Player.getVolume() * 200}px`;
                            }, 200);
                        }
                    },
                })
            ),
            react.createElement(
                "div",
                {
                    id: "fad-volbar",
                    onClick: (e) => {
                        let temp = 200 - e.nativeEvent.layerY;
                        if (temp < 0) {
                            temp = 0;
                        }
                        Spicetify.Player.setVolume(temp / 200);
                        document.querySelector("#fad-volbar-inner").style.height = `${temp}px`;
                    },
                },
                react.createElement("div", {
                    id: "fad-volbar-inner",
                    style: {
                        height: `${value * 200}px`,
                    },
                })
            )
        );
    };

    const upNext = async ({ index, queue }) => {
        let meta,
            uri,
            bottom = -100,
            right = 0,
            color,
            context,
            invertDetails = false,
            invertWhole = false,
            isContext = false,
            isColor = false;

        let deets = document.querySelector("#fad-details");
        const coor = deets.getBoundingClientRect();
        let scale = CONFIG["scale"];
        if (coor.bottom + scale * 90 + 10 > window.innerHeight) {
            bottom = bottom + (coor.bottom + 90 * scale + 10 - window.innerHeight) / scale + 10;
            right = -409;
        }

        if (Spicetify.Player.getRepeat() == 2) {
            uri = Spicetify.Player.data.item.uri;
            meta = Spicetify.Player.data.item.metadata;
        } else {
            // @ts-ignore
            uri = Spicetify.Queue.nextTracks[index].contextTrack.uri;
            // @ts-ignore
            meta = Spicetify.Queue.nextTracks[index].contextTrack.metadata;
        }

        let artistNames = Object.keys(meta)
            .filter((key) => key.startsWith("artist_name"))
            .sort()
            .map((key) => meta[key])
            .join(" • ");
        //@ts-ignore
        if (Spicetify.Queue.nextTracks[index].provider == "context") {
            isContext = true;
            context = Spicetify.Player.data.context.metadata.context_description;
            if (!context) {
                const uriObj = Spicetify.URI.fromString(Spicetify.Player.data.context.uri);
                switch (uriObj.type) {
                    case Spicetify.URI.Type.SEARCH:
                        context = `Search`;
                        break;
                    case Spicetify.URI.Type.COLLECTION:
                        context = "Liked Songs";
                        break;
                    case Spicetify.URI.Type.STATION:
                    case Spicetify.URI.Type.RADIO:
                        // @ts-ignore
                        const rType = uriObj.args[0];
                        context = `${rType} radio`;
                        break;
                    case Spicetify.URI.Type.FOLDER:
                        context = "Playlist Folder";
                        break;
                    default:
                        context = "unknown";
                }
            }
        }

        if (CONFIG["optionBackground"] === "colorText") {
            isColor = true;
            color = await fetchColors(uri);
            color = color[CONFIG["colorChoice"]];
            const luma =
                parseInt(color.substring(1, 3), 16) * 0.2126 +
                parseInt(color.substring(3, 5), 16) * 0.7152 +
                parseInt(color.substring(5, 7), 16) * 0.0722;
            if (luma > 180) {
                invertDetails = true;
            }
            if (deets.style.filter == "invert(1)") {
                invertWhole = true;
            }
        }

        return react.createElement(
            "div",
            {
                id: "fad-upnext",
                style: {
                    bottom: queue ? "" : `${bottom}px`,
                    right: queue ? "" : `${right}px`,
                    backgroundColor: isColor ? color : "",
                    backgroundImage: isColor ? "" : `url(${meta.image_url})`,
                    backgroundPosition: isColor ? "" : "center",
                    backgroundRepeat: isColor ? "" : "no-repeat",
                    backgroundSize: isColor ? "" : "cover",
                    border: isColor ? "" : "2px solid",
                    borderColor: isColor ? "" : "white",
                    clipPath: queue ? (index == 0 ? "inset(0px 0px 0px)" : "inset(90px 0px 0px)") : "",
                    filter: invertWhole ? "invert(1)" : "invert(0)",
                },
                ref: (el) => !queue && el && el.style.setProperty("box-shadow", "0 0 8px rgb(0 0 0 / 30%)", "important"),
            },
            !isColor &&
                react.createElement("div", {
                    id: "fad-upnext-blur",
                }),
            react.createElement("div", {
                id: "fad-upnext-image",
                style: {
                    backgroundImage: `url(${meta.image_url})`,
                },
            }),
            react.createElement(
                "div",
                {
                    id: "fad-upnext-details",
                    style: { filter: invertDetails ? "invert(1)" : "invert(0)" },
                },
                react.createElement(
                    "p",
                    {
                        id: "fad-upnext-provider",
                        style: {
                            fontWeight: "700",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "300px",
                        },
                    },
                    queue
                        ? isContext
                            ? `Track No.${index + 1} in Queue from ${context}`
                            : `Track No.${index + 1} from Queue`
                        : isContext
                        ? `Next From ${context}:`
                        : "Next in Queue:"
                    // isContext && react.createElement("em", {}, `${context}:`)
                ),
                react.createElement(
                    "div",
                    {
                        id: "fad-upnext-title",
                        style: {
                            fontSize: "18px",
                            fontWeight: "900",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "300px",
                        },
                    },
                    meta.title
                ),
                react.createElement(
                    "div",
                    {
                        id: "fad-upnext-artist",
                        style: {
                            fontWeight: "500",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "300px",
                        },
                    },
                    artistNames
                )
            )
        );
    };

    const PlayerControls = () => {
        const [value, setValue] = useState(Spicetify.Player.isPlaying());
        let timer;
        useEffect(() => {
            const update = () => setValue(Spicetify.Player.isPlaying());
            Spicetify.Player.addEventListener("onplaypause", update);
            // @ts-ignore
            return () => Spicetify.Player.removeEventListener("onplaypause", update);
        });
        return react.createElement(
            "div",
            { id: "fad-controls" },
            react.createElement(ButtonIcon, {
                // @ts-ignore
                icon: Spicetify.SVGIcons["skip-back"],
                onClick: Spicetify.Player.back,
            }),
            react.createElement(ButtonIcon, {
                // @ts-ignore
                icon: Spicetify.SVGIcons[value ? "pause" : "play"],
                onClick: Spicetify.Player.togglePlay,
            }),
            react.createElement(ButtonIcon, {
                // @ts-ignore
                icon: Spicetify.SVGIcons["skip-forward"],
                onClick: Spicetify.Player.next,
                onMouseEnter: async () => {
                    timer = setTimeout(async () => {
                        let cont = document.createElement("div");
                        cont.id = "fad-upnext-container";
                        let fore = document.querySelector("#fad-details");
                        fore.append(cont);
                        reactDOM.render(await upNext({ index: 0, queue: false }), cont);
                    }, 450);
                },
                onMouseLeave: () => {
                    let cont = document.querySelectorAll("#fad-upnext-container");
                    for (const con of cont) {
                        con.remove();
                    }
                    clearTimeout(timer);
                },
            })
        );
    };

    const ExtraPlayerControls = () => {
        const [isShuffle, setShuffle] = useState(Spicetify.Player.getShuffle());
        const [isRepeat, setRepeat] = useState(Spicetify.Player.getRepeat());
        const [isHeart, setHeart] = useState(Spicetify.Player.getHeart());
        const [isPodcast, setPodcast] = useState(Spicetify.URI.isEpisode(Spicetify.Player.data.item.uri));
        useEffect(() => {
            const update = ({ data }) => {
                data.item.metadata["collection.in_collection"] == "true" ? setHeart(true) : setHeart(false);

                setPodcast(Spicetify.URI.isEpisode(Spicetify.Player.data.item.uri));
                // @ts-ignore
                const state = Spicetify.Player.origin._state;
                if (!state.restrictions?.canToggleShuffle) {
                    setShuffle(undefined);
                }
                if (!state.restrictions?.canToggleRepeatContext || !state.restrictions?.canToggleRepeatTrack) {
                    setRepeat(undefined);
                }
            };
            Spicetify.Player.addEventListener("songchange", update);
            // @ts-ignore
            return () => Spicetify.Player.removeEventListener("songchange", update);
        });
        return react.createElement(
            "div",
            {
                id: "fad-extracontrols",
                style: {
                    marginTop: CONFIG.vertical ? (CONFIG.enableControl ? "-25px" : "10px") : CONFIG.enableControl ? "-25px" : "",
                    width: CONFIG.vertical ? (CONFIG.enableControl ? "100%" : "") : CONFIG.enableControl ? "360px" : "",
                    alignSelf: !CONFIG.vertical && CONFIG.enableControl ? "baseline" : "",
                },
            },
            react.createElement(ButtonIcon, {
                // @ts-ignore
                className: isShuffle
                    ? "dot-after"
                    : // @ts-ignore
                    !Spicetify.Player.origin._state.restrictions?.canToggleShuffle || isShuffle == undefined
                    ? "crossed-out"
                    : "",
                style: {
                    marginLeft: CONFIG.vertical ? "18px" : "",
                },
                // @ts-ignore
                icon: Spicetify.SVGIcons["shuffle"],
                onClick: () => {
                    Spicetify.Player.toggleShuffle();
                    setShuffle(!isShuffle);
                },
            }),
            react.createElement(ButtonIcon, {
                // @ts-ignore
                className: isRepeat
                    ? "dot-after"
                    : // @ts-ignore
                    !Spicetify.Player.origin._state.restrictions?.canToggleRepeatContext ||
                      // @ts-ignore
                      !Spicetify.Player.origin._state.restrictions?.canToggleRepeatTrack ||
                      isRepeat == undefined
                    ? "crossed-out"
                    : "",
                // @ts-ignore
                icon: Spicetify.SVGIcons[isRepeat == 2 ? "repeat-once" : "repeat"],
                onClick: () => {
                    Spicetify.Player.toggleRepeat();
                    setRepeat((isRepeat + 1) % 3);
                },
            }),
            react.createElement(ButtonIcon, {
                // @ts-ignore
                icon: isPodcast
                    ? Spicetify.SVGIcons[isHeart ? "check-alt-fill" : "plus-alt"]
                    : Spicetify.SVGIcons[isHeart ? "heart-active" : "heart"],
                style: {
                    marginLeft: CONFIG.vertical || CONFIG.enableControl ? "auto" : "",
                    marginRight: !CONFIG.vertical && !CONFIG.enableControl ? "10px" : "",
                },
                onClick: () => {
                    Spicetify.Player.toggleHeart();
                    setHeart(!isHeart);
                },
            }),
            CONFIG.enableControl &&
                react.createElement(ButtonIcon, {
                    // @ts-ignore
                    icon: '<path d="M2 2v5l4.33-2.5L2 2zm0 12h14v-1H2v1zm0-4h14V9H2v1zm7-5v1h7V5H9z"></path>',
                    className: "fad-queue-button",
                    // @ts-ignore
                    // @ts-ignore
                    onClick: async (e) => {
                        let ele = document.querySelector(".fad-queue-button");
                        if (ele.classList.contains("dot-after")) {
                            let cont = document.querySelector("#fad-queue-container");
                            cont.remove();
                            ele.classList.remove("dot-after");
                            return;
                        }
                        ele.classList.add("dot-after");

                        let body = document.querySelector("#fad-body");

                        let noticont = document.createElement("div");
                        noticont.className = "main-notificationBubbleContainer-NotificationBubbleContainer";
                        let notitext = document.createElement("div");
                        notitext.className = "main-notificationBubble-NotificationBubble main-notificationBubble-isNotice";
                        notitext.innerText = "Generating queue...";
                        noticont.append(notitext);
                        body.append(noticont);
                        setTimeout(function () {
                            noticont.remove();
                        }, 1000);

                        const next = await upNext({ index: 0, queue: false });
                        const bottom = next.props.style.bottom;
                        const right = next.props.style.right;

                        CONFIG["viewing"] = 0;

                        let tracks = [];
                        for (var i = 0; i < 10; i++) {
                            try {
                                tracks.push(await upNext({ index: i, queue: true }));
                            } catch {
                                break;
                            }
                        }

                        let scroll = react.createElement(
                            "div",
                            {
                                id: "scroll-queue",
                                style: {
                                    bottom: bottom,
                                    right: right,
                                    borderRadius: "10px",
                                    boxShadow: "0 0 8px rgb(0 0 0 / 30%)",
                                },
                                onWheel: (e) => {
                                    var now = Date.now();
                                    if (time !== -1 && now - time < 1000) return;
                                    time = now;

                                    if (e.deltaY > 0) {
                                        if (CONFIG["viewing"] == tracks.length - 1) {
                                            return;
                                        }
                                        CONFIG["viewing"] += 1;
                                        var item = document.querySelector("#scroll-queue").childNodes[CONFIG["viewing"]];
                                        // @ts-ignore
                                        item.style.clipPath = "inset(0px 0px 0px)";
                                    } else {
                                        if (CONFIG["viewing"] == 0) {
                                            return;
                                        }
                                        var item = document.querySelector("#scroll-queue").childNodes[CONFIG["viewing"]];
                                        // @ts-ignore
                                        item.style.clipPath = "inset(90px 0px 0px)";
                                        CONFIG["viewing"] -= 1;
                                    }
                                },
                            },
                            tracks
                        );
                        let fore = document.querySelector("#fad-details");
                        let wrapper = document.createElement("div");
                        wrapper.id = "fad-queue-container";
                        fore.append(wrapper);
                        reactDOM.render(scroll, wrapper);
                    },
                })
        );
    };

    class FAD extends react.Component {
        constructor(props) {
            super(props);

            this.state = {
                title: "",
                artist: "",
                album: "",
                cover: "",
            };
            this.currTrackImg = new Image();
            this.nextTrackImg = new Image();
            this.mousetrap = new Spicetify.Mousetrap();
        }

        async getAlbumDate(uri) {
            const id = uri.replace("spotify:album:", "");
            // const albumInfo = await Spicetify.CosmosAsync.get(`hm://album/v1/album-app/album/${id}/desktop`);

            // const albumDate = new Date(albumInfo.year, (albumInfo.month || 1) - 1, albumInfo.day || 0);
            // hermes protocol deprecated 1.1.81 onwards
            const albumInfo = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/albums/${id}`);
            const albumDate = new Date(albumInfo.release_date);
            const recentDate = new Date();
            recentDate.setMonth(recentDate.getMonth() - 6);
            return albumDate.toLocaleString("default", albumDate > recentDate ? { year: "numeric", month: "short" } : { year: "numeric" });
        }

        async fetchInfo() {
            const meta = Spicetify.Player.data.item.metadata;
            const prevUri = nextUri;
            nextUri = Spicetify.Player.data.item.uri;
            const uriFinal = nextUri.split(":")[2];
            let isLocalOrEpisode =
                Spicetify.URI.isLocalTrack(Spicetify.Player.data.item.uri) || Spicetify.URI.isEpisode(Spicetify.Player.data.item.uri);

            if (!isLocalOrEpisode) {
                const ximage = await Spicetify.CosmosAsync.get("https://api.spotify.com/v1/tracks/" + uriFinal);
                let images = ximage.album.images;
                for (const image of images) {
                    if (image.height == 640) {
                        finImage = image.url;
                    }
                }
                updateStyle();
            } else {
                finImage = meta.image_xlarge_url;
                style.innerHTML =
                    styleBase +
                    styleChoices[CONFIG.vertical ? 1 : 0] +
                    (window.innerHeight > window.innerWidth && CONFIG.verticalMonitor ? verticalMonitorStyle : "");
            }

            // prepare title
            let rawTitle = meta.title;
            if (CONFIG["trimTitle"] === "justFeat") {
                rawTitle = rawTitle
                    .replace(/-\s+(feat|with|ft).*/i, "")
                    .replace(/(\(|\[)(feat|with|ft)\.?\s+.*(\)|\])/i, "")
                    .trim();
            } else if (CONFIG["trimTitle"] === "trimEvery") {
                rawTitle = rawTitle
                    .replace(/\(.+?\)/g, "")
                    .replace(/\[.+?\]/g, "")
                    .replace(/\s\-\s.+?$/, "")
                    .replace(/,.+?$/, "")
                    .trim();
            }

            // prepare artist
            let artistName;
            if (CONFIG.showAllArtists) {
                artistName = Object.keys(meta)
                    .filter((key) => key.startsWith("artist_name"))
                    .sort()
                    .map((key) => meta[key])
                    .join(", ");
            } else {
                artistName = meta.artist_name;
            }

            // prepare album
            let albumText = meta.album_title || "";
            if (CONFIG.showAlbum) {
                const albumURI = meta.album_uri;
                if (albumURI?.startsWith("spotify:album:")) {
                    albumText += " • " + (await this.getAlbumDate(albumURI));
                }
            }

            //          if (meta.image_xlarge_url === this.currTrackImg.src) {
            if (finImage === this.currTrackImg.src) {
                this.setState({
                    title: rawTitle || "",
                    artist: artistName || "",
                    album: albumText || "",
                });
                if (CONFIG["optionBackground"] === "colorText" && !isLocalOrEpisode) {
                    this.animateCanvasColor(prevUri, prevUri);
                } else if (CONFIG["optionBackground"] === "static" && !isLocalOrEpisode) {
                    this.animateCanvasColor(prevUri, prevUri, true);
                } else if (CONFIG["optionBackground"] === "albumart") {
                    this.animateCanvas(this.currTrackImg, this.currTrackImg);
                }
                return;
            }

            if (isHidden) {
                isHidden = false;
                updateStyle();
            }

            // TODO: Pre-load next track
            // Wait until next track image is downloaded then update UI text and images
            const previousImg = this.currTrackImg.cloneNode();
            this.currTrackImg.src = finImage;
            this.currTrackImg.onload = () => {
                const bgImage = this.currTrackImg.src;
                if (CONFIG["optionBackground"] === "colorText" && !isLocalOrEpisode) {
                    this.animateCanvasColor(prevUri, nextUri);
                } else if (CONFIG["optionBackground"] === "static" && !isLocalOrEpisode) {
                    this.animateCanvasColor(prevUri, nextUri, true);
                } else if (CONFIG["optionBackground"] === "albumart") {
                    this.animateCanvas(previousImg, this.currTrackImg);
                }
                if (CONFIG.enableFade) {
                    this.deets.style.animation = "";
                    void this.deets.offsetWidth;
                    this.deets.style.animation = "textchange 1s forwards";
                }
                this.setState({
                    title: rawTitle || "",
                    artist: artistName || "",
                    album: albumText || "",
                    cover: bgImage,
                });

                if (CONFIG.lyricsPlus) {
                    autoHideLyrics();
                }
            };
            this.currTrackImg.onerror = () => {
                // Placeholder
                this.currTrackImg.src =
                    "data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9Im5vIj8+CjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCI+CiAgPHJlY3Qgc3R5bGU9ImZpbGw6I2ZmZmZmZiIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiB4PSIwIiB5PSIwIiAvPgogIDxwYXRoIGZpbGw9IiNCM0IzQjMiIGQ9Ik0yNi4yNSAxNi4xNjJMMjEuMDA1IDEzLjEzNEwyMS4wMTIgMjIuNTA2QzIwLjU5NCAyMi4xOTIgMjAuMDgxIDIxLjk5OSAxOS41MTkgMjEuOTk5QzE4LjE0MSAyMS45OTkgMTcuMDE5IDIzLjEyMSAxNy4wMTkgMjQuNDk5QzE3LjAxOSAyNS44NzggMTguMTQxIDI2Ljk5OSAxOS41MTkgMjYuOTk5QzIwLjg5NyAyNi45OTkgMjIuMDE5IDI1Ljg3OCAyMi4wMTkgMjQuNDk5QzIyLjAxOSAyNC40MjIgMjIuMDA2IDE0Ljg2NyAyMi4wMDYgMTQuODY3TDI1Ljc1IDE3LjAyOUwyNi4yNSAxNi4xNjJaTTE5LjUxOSAyNS45OThDMTguNjkyIDI1Ljk5OCAxOC4wMTkgMjUuMzI1IDE4LjAxOSAyNC40OThDMTguMDE5IDIzLjY3MSAxOC42OTIgMjIuOTk4IDE5LjUxOSAyMi45OThDMjAuMzQ2IDIyLjk5OCAyMS4wMTkgMjMuNjcxIDIxLjAxOSAyNC40OThDMjEuMDE5IDI1LjMyNSAyMC4zNDYgMjUuOTk4IDE5LjUxOSAyNS45OThaIi8+Cjwvc3ZnPgo=";
            };
        }

        animateCanvas(prevImg, nextImg) {
            const { innerWidth: width, innerHeight: height } = window;
            this.back.width = width;
            this.back.height = height;
            const dim = width > height ? width : height;

            this.deets.style.filter = "invert(0)";
            if (!(CONFIG["volumeBar"] === "disable")) {
                document.querySelector("#fad-volume").style.filter = "invert(0)";
            }

            if (CONFIG.lyricsPlus) {
                this.lyrics.style.setProperty("--lyrics-color-active", "#ffffff");
                this.lyrics.style.setProperty("--lyrics-color-inactive", "#ffffff50");
            }

            const ctx = this.back.getContext("2d");
            ctx.imageSmoothingEnabled = false;
            ctx.filter = `blur(30px) brightness(0.6)`;
            const blur = 30;

            if (!CONFIG.enableFade) {
                ctx.globalAlpha = 1;
                width > height
                    ? ctx.drawImage(nextImg, -blur * 2, -blur * 2 - (width - height) / 2, dim + 4 * blur, dim + 4 * blur)
                    : ctx.drawImage(nextImg, -blur * 2 - (height - width) / 2, -blur * 2, dim + 4 * blur, dim + 4 * blur);
                return;
            }

            let factor = 0.0;
            const animate = () => {
                ctx.globalAlpha = 1;
                width > height
                    ? ctx.drawImage(prevImg, -blur * 2, -blur * 2 - (width - height) / 2, dim + 4 * blur, dim + 4 * blur)
                    : ctx.drawImage(prevImg, -blur * 2 - (height - width) / 2, -blur * 2, dim + 4 * blur, dim + 4 * blur);
                ctx.globalAlpha = Math.sin((Math.PI / 2) * factor);
                width > height
                    ? ctx.drawImage(nextImg, -blur * 2, -blur * 2 - (width - height) / 2, dim + 4 * blur, dim + 4 * blur)
                    : ctx.drawImage(nextImg, -blur * 2 - (height - width) / 2, -blur * 2, dim + 4 * blur, dim + 4 * blur);

                if (factor < 1.0) {
                    factor += 0.016;
                    requestAnimationFrame(animate);
                }
            };

            requestAnimationFrame(animate);
        }

        async animateCanvasColor(prevUri, nextUri, isStatic = false) {
            const { innerWidth: width, innerHeight: height } = window;
            const ctx = this.back.getContext("2d");

            if (isStatic) {
                if (ctx.fillStyle == CONFIG["staticColor"]) {
                    return;
                } else {
                    ctx.filter = "brightness(1)";
                    ctx.imageSmoothingEnabled = false;
                    ctx.globalAlpha = 1;
                    ctx.fillStyle = CONFIG["staticColor"];
                    ctx.fillRect(0, 0, width, height);
                    return;
                }
            }

            prevColor = await fetchColors(prevUri);
            nextColor = await fetchColors(nextUri);

            this.back.width = width;
            this.back.height = height;

            CONFIG["color"] = nextColor;
            saveConfig();

            this.deets.style.filter = "invert(0)";

            if (!(CONFIG["volumeBar"] === "disable")) {
                document.querySelector("#fad-volume").style.filter = "invert(0)";
            }

            if (CONFIG.lyricsPlus) {
                this.lyrics.style.setProperty("--lyrics-color-active", "#ffffff");
                this.lyrics.style.setProperty("--lyrics-color-inactive", "#ffffff50");
            }

            prevColor = prevColor[CONFIG["colorChoice"]];
            nextColor = nextColor[CONFIG["colorChoice"]];
            const luma =
                parseInt(nextColor.substring(1, 3), 16) * 0.2126 +
                parseInt(nextColor.substring(3, 5), 16) * 0.7152 +
                parseInt(nextColor.substring(5, 7), 16) * 0.0722;

            console.log(nextColor);
            if (luma > 180) {
                this.deets.style.filter = "invert(1)";

                if (!(CONFIG["volumeBar"] === "disable")) {
                    document.querySelector("#fad-volume").style.filter = "invert(1)";
                }
                if (CONFIG.lyricsPlus) {
                    this.lyrics.style.setProperty("--lyrics-color-active", "#000000");
                    this.lyrics.style.setProperty("--lyrics-color-inactive", "#00000050");
                }
            }

            if (!CONFIG.enableFade) {
                ctx.globalAlpha = 1;
                ctx.fillStyle = nextColor;
                ctx.fillRect(0, 0, width, height);
                return;
            }

            let factor = 0.0;
            const animate = () => {
                ctx.globalAlpha = 1;
                ctx.fillStyle = prevColor;
                ctx.fillRect(0, 0, width, height);
                ctx.globalAlpha = Math.sin((Math.PI / 2) * factor);
                ctx.fillStyle = nextColor;
                ctx.fillRect(0, 0, width, height);

                if (factor < 1.0) {
                    factor += 0.016;
                    requestAnimationFrame(animate);
                }
            };
            requestAnimationFrame(animate);
        }

        componentDidMount() {
            this.updateInfo = this.fetchInfo.bind(this);
            Spicetify.Player.addEventListener("songchange", this.updateInfo);
            this.updateInfo();

            updateVisual = () => {
                updateStyle();
                this.fetchInfo();
            };

            this.onQueueChange = async (queue) => {
                queue = queue.data;
                let nextTrack;
                if (queue.queued.length) {
                    nextTrack = queue.queued[0];
                } else {
                    nextTrack = queue.nextUp[0];
                }
                this.nextTrackImg.src = nextTrack.metadata.image_xlarge_url;
            };

            const scaleLimit = { min: 0.1, max: 4, step: 0.05 };
            this.onScaleChange = (event) => {
                if (!event.ctrlKey) return;
                let dir = event.deltaY < 0 ? 1 : -1;
                let temp = (CONFIG["scale"] || 1) + dir * scaleLimit.step;
                if (temp < scaleLimit.min) {
                    temp = scaleLimit.min;
                } else if (temp > scaleLimit.max) {
                    temp = scaleLimit.max;
                }
                CONFIG["scale"] = temp;
                saveConfig();
                updateVisual();
            };

            Spicetify.Platform.PlayerAPI._events.addListener("queue_update", this.onQueueChange);
            this.mousetrap.bind("esc", deactivate);
            window.dispatchEvent(new Event("fad-request"));
        }

        componentWillUnmount() {
            Spicetify.Player.removeEventListener("songchange", this.updateInfo);
            Spicetify.Platform.PlayerAPI._events.removeListener("queue_update", this.onQueueChange);
            this.mousetrap.unbind("esc");
        }

        render() {
            return react.createElement(
                "div",
                {
                    id: "full-app-display",
                    className: "Video VideoPlayer--fullscreen VideoPlayer--landscape",
                    onDoubleClick: deactivate,
                    onContextMenu: openConfig,
                },
                !(CONFIG["optionBackground"] === "grad") &&
                    react.createElement("canvas", {
                        id: "fad-background",
                        ref: (el) => (this.back = el),
                    }),
                CONFIG["optionBackground"] === "grad" &&
                    react.createElement(
                        "div",
                        { id: "fad-gradient-background" },
                        react.createElement("img", {
                            src: this.state.cover,
                            className: "fad-grad-image",
                            style: {
                                right: "-15%",
                                top: "-20%",
                                zIndex: 10,
                                transform: "scale(2)",
                            },
                        }),
                        react.createElement("img", {
                            src: this.state.cover,
                            className: "fad-grad-image",
                            style: {
                                left: "-5%",
                                bottom: "-10%",
                                transform: "scale(1.5)",
                                zIndex: 1,
                                animationDirection: "reverse",
                            },
                        }),
                        react.createElement("img", {
                            src: this.state.cover,
                            className: "fad-grad-image",
                            style: {
                                width: "200%",
                                right: "-50%",
                                top: "-33%",
                                filter: "blur(69px) brightness(0.6)",
                                zIndex: 0,
                                animationDirection: "reverse",
                            },
                        })
                    ),
                react.createElement("div", { id: "fad-header" }),
                react.createElement(
                    "div",
                    { id: "fad-body" },
                    react.createElement(
                        "div",
                        {
                            id: "fad-foreground",
                            style: {
                                "--fad-scale": CONFIG["scale"] || 1,
                                zIndex: 20,
                            },
                            ref: (el) => {
                                if (!el) return;
                                el.onmousewheel = this.onScaleChange;
                            },
                        },
                        react.createElement(
                            "div",
                            { id: "fad-art" },
                            react.createElement(
                                "div",
                                {
                                    id: "fad-art-image",
                                    className: CONFIG.enableFade && "fad-background-fade",
                                    style: {
                                        backgroundImage: `url("${this.state.cover}")`,
                                    },
                                },
                                react.createElement("div", { id: "fad-art-inner" })
                            )
                        ),
                        react.createElement(
                            "div",
                            { id: "fad-details", ref: (el) => (this.deets = el) },
                            react.createElement("div", { id: "fad-title" }, this.state.title),
                            react.createElement(SubInfo, {
                                id: "fad-artist",
                                text: this.state.artist,
                                // @ts-ignore
                                icon: Spicetify.SVGIcons.artist,
                            }),
                            CONFIG.showAlbum &&
                                react.createElement(SubInfo, {
                                    id: "fad-album",
                                    text: this.state.album,
                                    // @ts-ignore
                                    icon: Spicetify.SVGIcons.album,
                                }),
                            react.createElement(
                                "div",
                                {
                                    id: "fad-status",
                                    className: (CONFIG.enableControl || CONFIG.enableProgress) && "active",
                                    style: {
                                        flexDirection: !CONFIG.vertical && CONFIG.enableControl && CONFIG.enableExtraControl ? "column" : "",
                                    },
                                },
                                CONFIG.enableControl && react.createElement(PlayerControls),
                                CONFIG.enableExtraControl && react.createElement(ExtraPlayerControls),
                                CONFIG.enableProgress && react.createElement(ProgressBar)
                            )
                        )
                    ),
                    // @ts-ignore
                    !(CONFIG["volumeBar"] === "disable") && react.createElement(VolumeBar),
                    CONFIG.lyricsPlus &&
                        react.createElement("div", {
                            id: "fad-lyrics-plus-container",
                            style: {
                                "--lyrics-color-active": "#ffffff",
                                "--lyrics-color-inactive": "#ffffff50",
                            },
                            ref: (el) => (this.lyrics = el),
                        })
                )
            );
        }
    }

    const classes = ["video", "video-full-screen", "video-full-window", "video-full-screen--hide-ui", "fad-activated"];

    const container = document.createElement("div");
    container.id = "fad-main";
    let lastApp;

    async function toggleFullscreen() {
        if (CONFIG.enableFullscreen) {
            await document.documentElement.requestFullscreen();
            // @ts-ignore
        } else if (document.webkitIsFullScreen) {
            await document.exitFullscreen();
        }
    }

    async function activate() {
        await toggleFullscreen();

        document.body.classList.add(...classes);
        document.body.append(style, container);
        reactDOM.render(react.createElement(FAD), container);

        requestLyricsPlus();
    }

    function deactivate() {
        // @ts-ignore
        if (CONFIG.enableFullscreen || document.webkitIsFullScreen) {
            document.exitFullscreen();
        }
        document.body.classList.remove(...classes);
        reactDOM.unmountComponentAtNode(container);
        style.remove();
        container.remove();
        window.dispatchEvent(new Event("fad-request"));

        if (lastApp && lastApp !== "/lyrics-plus") {
            Spicetify.Platform.History.push(lastApp);
        }
    }

    function toggleFad() {
        if (document.body.classList.contains("fad-activated")) {
            deactivate();
        } else {
            activate();
        }
    }

    function updateStyle() {
        style.innerHTML =
            styleBase +
            styleChoices[CONFIG.vertical ? 1 : 0] +
            (checkLyricsPlus() && CONFIG.lyricsPlus && !isHidden
                ? lyricsPlusBase +
                  lyricsPlusStyleChoices[CONFIG.vertical ? 1 : 0] +
                  (window.innerHeight > window.innerWidth && CONFIG.verticalMonitor ? verticalMonitorStyle : "")
                : "");
    }

    function checkLyricsPlus() {
        return Spicetify.Config?.custom_apps?.includes("lyrics-plus") || !!document.querySelector("a[href='/lyrics-plus']");
    }

    function autoHideLyrics() {
        // @ts-ignore
        if (!document.querySelector("#fad-lyrics-plus-container").innerText) {
            setTimeout(autoHideLyrics, 100);
        } else {
            // @ts-ignore
            if (document.querySelector("#fad-lyrics-plus-container").innerText == "(• _ • )") {
                isHidden = true;
                updateStyle();
            }
        }
    }

    function requestLyricsPlus() {
        if (CONFIG.lyricsPlus && checkLyricsPlus()) {
            lastApp = Spicetify.Platform.History.location.pathname;
            if (lastApp !== "/lyrics-plus") {
                Spicetify.Platform.History.push("/lyrics-plus");
            }
        }
        window.dispatchEvent(new Event("fad-request"));
        autoHideLyrics();
    }

    function getConfig() {
        try {
            const parsed = JSON.parse(Spicetify.LocalStorage.get("full-app-display-config") || "{}");
            if (parsed && typeof parsed === "object") {
                return parsed;
            }
            throw "";
        } catch {
            Spicetify.LocalStorage.set("full-app-display-config", "{}");
            return {};
        }
    }

    function saveConfig() {
        Spicetify.LocalStorage.set("full-app-display-config", JSON.stringify(CONFIG));
    }

    const ConfigItem = ({ name, field, func, disabled = false }) => {
        const [value, setValue] = useState(CONFIG[field]);
        return react.createElement(
            "div",
            { className: "setting-row" },
            react.createElement("label", { className: "col description" }, name),
            react.createElement(
                "div",
                { className: "col action" },
                react.createElement(
                    "button",
                    {
                        className: "switch" + (value ? "" : " disabled"),
                        disabled,
                        onClick: () => {
                            const state = !value;
                            CONFIG[field] = state;
                            setValue(state);
                            saveConfig();
                            func();
                        },
                    },
                    // @ts-ignore
                    react.createElement(DisplayIcon, { icon: Spicetify.SVGIcons.check, size: 16 })
                )
            )
        );
    };

    const ConfigSelection = ({ name, field, options, def, func }) => {
        const [value, setValue] = useState(CONFIG[field] ?? def);
        return react.createElement(
            "div",
            { className: "setting-row" },
            react.createElement("label", { className: "col description" }, name),
            react.createElement(
                "div",
                { className: "col action" },
                react.createElement(
                    "select",
                    {
                        value,
                        onChange: (e) => {
                            setValue(e.target.value);
                            CONFIG[field] = e.target.value;
                            saveConfig();
                            func();
                        },
                    },
                    Object.keys(options).map((item) =>
                        react.createElement(
                            "option",
                            {
                                value: item,
                            },
                            options[item]
                        )
                    )
                )
            )
        );
    };

    const ConfigInput = ({ name, field, func, isColor = false }) => {
        const [value, setValue] = useState(CONFIG[field]);
        return react.createElement(
            "div",
            { className: "setting-row" },
            react.createElement("label", { className: "col description" }, name),
            react.createElement(
                "div",
                { className: "col action" },
                react.createElement("input", {
                    type: isColor ? "color" : "",
                    value,
                    className: "input",
                    onChange: (e) => {
                        setValue(e.target.value);
                        CONFIG[field] = e.target.value;
                        saveConfig();
                        func();
                    },
                })
            )
        );
    };

    const ConfigHotkey = ({ name, field, def, onChange = () => {} }) => {
        const [value, setValue] = useState(CONFIG[field] ?? def);
        const [trap] = useState(new Spicetify.Mousetrap());

        function record() {
            trap.handleKey = (character, modifiers, e) => {
                if (e.type == "keydown") {
                    const sequence = [...new Set([...modifiers, character])];
                    if (sequence.length === 1 && sequence[0] === "esc") {
                        onChange("");
                        setValue("");
                        return;
                    }
                    setValue(sequence.join("+"));
                }
            };
        }

        function finishRecord() {
            trap.handleKey = () => {};
            onChange(value);
        }

        return react.createElement(
            "div",
            {
                className: "setting-row",
            },
            react.createElement(
                "label",
                {
                    className: "col description",
                },
                name
            ),
            react.createElement(
                "div",
                {
                    className: "col action",
                },
                react.createElement("input", {
                    value,
                    onFocus: record,
                    onBlur: finishRecord,
                })
            )
        );
    };

    const colorRow = ({ name, color }) => {
        let originalColor;
        const modal = document.getElementsByTagName("generic-modal");
        return react.createElement(
            "div",
            { className: "color-row" },
            react.createElement("label", { className: "col description" }, name),
            react.createElement(
                "div",
                { className: "col action" },
                react.createElement("div", {
                    className: "col color",
                    style: {
                        height: "20px",
                        width: "20px",
                        border: "2px solid black",
                        clear: "both",
                        backgroundColor: CONFIG["color"][color],
                    },
                    // @ts-ignore
                    // @ts-ignore
                    onMouseEnter: (e) => {
                        originalColor = CONFIG["colorChoice"];
                        CONFIG["colorChoice"] = color;
                        // @ts-ignore
                        modal[0].style.opacity = 0.37;
                        updateVisual();
                    },
                    // @ts-ignore
                    // @ts-ignore
                    onMouseLeave: (e) => {
                        CONFIG["colorChoice"] = originalColor;
                        // @ts-ignore
                        modal[0].style.opacity = 1;
                        updateVisual();
                    },
                    // @ts-ignore
                    // @ts-ignore
                    onClick: (e) => {
                        CONFIG["colorChoice"] = color;
                        updateVisual();
                        // @ts-ignore
                        modal[0].style.opacity = 1;
                        Spicetify.PopupModal.hide();
                    },
                })
            )
        );
    };

    function openColor(event) {
        event.preventDefault();
        const style = react.createElement("style", {
            dangerouslySetInnerHTML: {
                __html: `
.color-row::after {
    content: "";
    display: table;
    clear: both;
}
.color-row .col {
    display: flex;
    padding: 10px 0;
    align-items: center;
}
.color-row .col.description {
    float: left;
    padding-right: 15px;
}
.color-row .col.action {
    float: right;
    text-align: right;
}
`,
            },
        });
        let colorContainer = react.createElement(
            "div",
            null,
            style,
            react.createElement(colorRow, { name: "Dark Vibrant", color: "DARK_VIBRANT" }),
            react.createElement(colorRow, { name: "Desaturated", color: "DESATURATED" }),
            react.createElement(colorRow, { name: "Light Vibrant", color: "LIGHT_VIBRANT" }),
            react.createElement(colorRow, { name: "Vibrant", color: "VIBRANT" }),
            react.createElement(colorRow, { name: "Vibrant(NA)", color: "VIBRANT_NON_ALARMING" })
        );
        Spicetify.PopupModal.display({
            title: "Color Display (Hover to preview)",
            content: colorContainer,
        });
    }

    function openConfig(event) {
        try {
            event.preventDefault();
        } catch {}
        const style = react.createElement("style", {
            dangerouslySetInnerHTML: {
                __html: `
.setting-row::after {
    content: "";
    display: table;
    clear: both;
}
.setting-row .col {
    display: flex;
    padding: 10px 0;
    align-items: center;
}
.setting-row .col.description {
    float: left;
    padding-right: 15px;
}
.setting-row .col.action {
    float: right;
    text-align: right;
}
.setting-row .col.action input {
    padding-left: 10px;
}
button.switch {
    align-items: center;
    border: 0px;
    border-radius: 50%;
    background-color: rgba(var(--spice-rgb-shadow), .7);
    color: var(--spice-text);
    cursor: pointer;
    display: flex;
    margin-inline-start: 12px;
    padding: 8px;
}
button.switch.disabled,
button.switch[disabled] {
    color: rgba(var(--spice-rgb-text), .3);
}
select {
    color: var(--spice-text);
    background: rgba(var(--spice-rgb-shadow), .7);
    border: 0;
    height: 32px;
}
`,
            },
        });
        let configContainer = react.createElement(
            "div",
            null,
            style,
            react.createElement(ConfigItem, {
                name: checkLyricsPlus() ? "Enable Lyrics Plus integration" : "Unable to find Lyrics Plus",
                field: "lyricsPlus",
                func: () => {
                    updateVisual();
                    requestLyricsPlus();
                    openConfig();
                },
                disabled: !checkLyricsPlus(),
            }),
            react.createElement(ConfigSelection, {
                name: "Background",
                field: "optionBackground",
                options: {
                    albumart: "Album Art",
                    colorText: "Colorful background",
                    static: "Static Color",
                    // grad: "Gradient",
                },
                func: updateVisual,
            }),
            CONFIG["optionBackground"] == "static" &&
                react.createElement(ConfigInput, {
                    name: "Select static color:",
                    field: "staticColor",
                    func: () => {
                        const ctx = document.getElementById("fad-background")?.getContext("2d");
                        ctx.filter = "brightness(1)";
                        ctx.imageSmoothingEnabled = false;
                        ctx.globalAlpha = 1;
                        ctx.fillStyle = CONFIG["staticColor"];
                        ctx.fillRect(0, 0, window.innerWidth, window.innerHeight);
                    },
                    isColor: true,
                }),
            react.createElement(ConfigItem, { name: "Enable progress bar", field: "enableProgress", func: updateVisual }),
            react.createElement(ConfigSelection, {
                name: "Enable volume bar",
                field: "volumeBar",
                options: {
                    disable: "Disable",
                    onlyHover: "Show on hover only",
                    alwaysOn: "Show always",
                },
                func: updateVisual,
            }),
            react.createElement(ConfigItem, { name: "Enable controls", field: "enableControl", func: updateVisual }),
            react.createElement(ConfigItem, { name: "Enable extra controls", field: "enableExtraControl", func: updateVisual }),
            react.createElement(ConfigSelection, {
                name: "Trim title",
                field: "trimTitle",
                options: {
                    dontTrim: "Don't trim title",
                    justFeat: "Trim just feat. and with ",
                    trimEvery: "Trim Everything",
                },
                func: updateVisual,
            }),
            react.createElement(ConfigItem, { name: "Show album", field: "showAlbum", func: updateVisual }),
            react.createElement(ConfigItem, { name: "Show all artists", field: "showAllArtists", func: updateVisual }),
            react.createElement(ConfigItem, { name: "Show icons", field: "icons", func: updateVisual }),
            react.createElement(ConfigItem, { name: "Vertical mode", field: "vertical", func: updateVisual }),
            CONFIG.lyricsPlus &&
                window.innerHeight > window.innerWidth &&
                react.createElement(ConfigItem, { name: "Vertical Monitor Mode", field: "verticalMonitor", func: updateStyle }),
            react.createElement(ConfigItem, { name: "Enable fullscreen", field: "enableFullscreen", func: toggleFullscreen }),
            react.createElement(ConfigItem, { name: "Enable song change animation", field: "enableFade", func: updateVisual }),
            react.createElement(ConfigHotkey, {
                name: "FAD hotkey: ",
                field: "hotkey",
                def: "alt+f",
                onChange: (key) => {
                    CONFIG["hotkey"] = key;
                    saveConfig();
                    Spicetify.Mousetrap.bind(key, toggleFad);
                },
            }),
            react.createElement(ConfigItem, { name: "Enable development features", field: "enableDev", func: openConfig }),

            CONFIG.enableDev &&
                react.createElement(ConfigSelection, {
                    name: "Color Choice (Press F6 for colors)",
                    field: "colorChoice",
                    options: {
                        DARK_VIBRANT: "Dark Vibrant",
                        DESATURATED: "Desaturated",
                        LIGHT_VIBRANT: "Light Vibrant",
                        VIBRANT: "Vibrant",
                        VIBRANT_NON_ALARMING: "Vibrant(NA)",
                    },
                    def: "LIGHT_VIBRANT",
                    func: updateVisual,
                })
        );
        Spicetify.PopupModal.display({
            title: "Full App Display",
            content: configContainer,
        });
    }

    // Add activator on top bar
    new Spicetify.Topbar.Button(
        "Full App Display",
        // @ts-ignore
        `<svg role="img" height="16" width="16" viewBox="0 0 16 16" fill="currentColor">${Spicetify.SVGIcons.projector}</svg>`,
        activate
    );

    Spicetify.Mousetrap.bind(CONFIG["hotkey"] ?? "alt+f", toggleFad);
    Spicetify.Mousetrap.bind("f6", openColor);
})();
