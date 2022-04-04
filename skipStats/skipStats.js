// @ts-check
// NAME: Skip Stats
// AUTHOR: huhridge
// DESCRIPTION: Tracks skipping stats in playlists and albums.
//TODO: Add liked songs.
/// <reference path="../globals.d.ts" />

(function skipStats() {
    if (!Spicetify.React || !Spicetify.ReactDOM || !Spicetify.Platform) {
        setTimeout(skipStats, 200);
        return;
    }

    const { LocalStorage, Platform, ReactDOM: reactDOM, React: react } = Spicetify;

    let progress;

    if (!Spicetify.LocalStorage.get("autoSkipThreshold")) {
        Spicetify.LocalStorage.set("autoSkipThreshold", "0");
    }

    if (!LocalStorage.get("skipData")) {
        LocalStorage.set("skipData", JSON.stringify({}));
    }

    setInterval(() => {
        progress = Spicetify.Player.getProgressPercent();
    }, 500);

    Spicetify.Player.addEventListener("songchange", trackSkips);

    async function trackSkips() {
        if (progress < 0.95) {
            await delay(200);
            //@ts-ignore
            let song_key = Spicetify.Queue.prevTracks.slice(-1)[0].contextTrack.uri;
            let skipData = JSON.parse(LocalStorage.get("skipData"));
            if (!skipData[song_key]) {
                skipData[song_key] = 1;
            } else {
                skipData[song_key] += 1;
            }
            LocalStorage.set("skipData", JSON.stringify(skipData));
        }
        //auto skip
        let skipData = JSON.parse(LocalStorage.get("skipData"));
        let thresh = Number(Spicetify.LocalStorage.get("autoSkipThreshold"));
        if (thresh > 0 && skipData[Spicetify.Player.data.track.uri] >= thresh) {
            Spicetify.Player.next();
            Spicetify.showNotification("The track was auto-skipped due to being skipped too many times.");
        }
        LocalStorage.set("skipData", JSON.stringify(skipData));
    }

    function resetSkips(mode, uri = "") {
        if (mode === "all") {
            LocalStorage.set("skipData", JSON.stringify({}));
            Spicetify.showNotification("Resetted all skip data!");
        } else if (mode === "current") {
            let skipData = JSON.parse(LocalStorage.get("skipData"));
            skipData[Spicetify.Player.data.track.uri] = 0;
            LocalStorage.set("skipData", JSON.stringify(skipData));
            Spicetify.showNotification("Resetted skip data for current track!");
        } else if (mode === "context") {
            let skipData = JSON.parse(LocalStorage.get("skipData"));
            skipData[uri] = 0;
            LocalStorage.set("skipData", JSON.stringify(skipData));
            Spicetify.showNotification("Resetted skip data for selected track!");
        }
    }

    async function seeStats(uri) {
        const uriObj = Spicetify.URI.fromString(uri);
        let tracks;
        switch (uriObj.type) {
            case Spicetify.URI.Type.PLAYLIST:
            case Spicetify.URI.Type.PLAYLIST_V2:
                tracks = await fetchPlaylist(uri);
                break;
            case Spicetify.URI.Type.ALBUM:
                tracks = await fetchAlbum(uri);
                break;
            // case Spicetify.URI.Type.COLLECTION:
            //     tracks = await fetchCollection();
            //     break;
        }
        let skipData = JSON.parse(LocalStorage.get("skipData"));
        tracks = tracks.filter((item) => Boolean(skipData[item.uri]));
        if (tracks.length == 0) {
            Spicetify.showNotification("No Skipping Data found!");
            return;
        }
        tracks.forEach((item) => {
            item.skips = skipData[item.uri];
        });
        tracks.sort((a, b) => b.skips - a.skips);
        const skipTable = statTable({ tracks: tracks });
        // @ts-ignore
        Spicetify.PopupModal.display({ title: "SkipStats", content: skipTable, isLarge: true });
    }

    function delay(delayInms) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(2);
            }, delayInms);
        });
    }

    const fetchPlaylist = async (uri) => {
        const res = await Spicetify.CosmosAsync.get(`sp://core-playlist/v1/playlist/${uri}/rows`);
        return res.rows.map((item, index) => ({
            uri: item.link,
            title: item.name,
            index: index + 1,
            album: item.album.name,
            artists: item.artists.map((item) => item.name).join(", "),
        }));
    };

    // const fetchCollection = async () => {
    //     const res = await Spicetify.CosmosAsync.get("sp://core-collection/unstable/@/list/tracks/all?responseFormat=protobufJson");
    //     return res.item.map((item) => ({
    //         uri: item.trackMetadata.link,
    //         title: item.trackMetadata.name,
    //         index: item.index + 1,
    //         album: item.trackMetadata.album.name,
    //         artists: item.trackMetadata.artist.map((item) => item.name).join(", "),
    //     }));
    // };

    const fetchAlbum = async (uri) => {
        const arg = uri.split(":")[2];
        const res = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/albums/${arg}`);
        return res.tracks.items.map((item) => ({
            uri: item.uri,
            title: item.name,
            index: item.track_number,
            album: res.name,
            artists: item.artists.map((item) => item.name).join(", "),
        }));
    };

    const statTable = ({ tracks }) => {
        const headers = ["Title", "Album", "Artists", "Skips"];
        let thresh = Number(Spicetify.LocalStorage.get("autoSkipThreshold"));
        let isThresh = Boolean(thresh);
        const style = react.createElement("style", {
            dangerouslySetInnerHTML: {
                __html: `
div[aria-label="SkipStats"] > div {
    min-width: max-content;
}
.styled-table {
    margin: 25px 0;
    font-size: 0.9em;
    font-family: sans-serif;
    min-width: 400px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.15);
    overflow: hidden;
    border-radius: 8px;
}
.styled-table thead tr {
    background-color: var(--spice-sidebar);
    color: var(--spice-sidebar-text);
    text-align: left;
    border-bottom: thin solid #dddddd;
}
tbody td:nth-child(4) {
    text-align: center;
}
.styled-table th,
.styled-table td {
    padding: 12px 15px;
    width: 1%;
    white-space: nowrap;
}
.styled-table tbody tr {
    border-bottom: thin solid #dddddd;
}
td.auto-skip {
    color: var(--spice-button-active);
}
                `,
            },
        });
        return react.createElement(
            "table",
            { className: "styled-table" },
            style,
            react.createElement(
                "thead",
                null,
                react.createElement(
                    "tr",
                    null,
                    headers.map((item) => react.createElement("th", null, item))
                )
            ),
            react.createElement(
                "tbody",
                null,
                tracks.map((track) =>
                    react.createElement(
                        "tr",
                        {
                            "data-id": track.uri,
                        },
                        // react.createElement("td", null, track.index),
                        react.createElement("td", null, track.title),
                        react.createElement("td", null, track.album),
                        react.createElement("td", null, track.artists),
                        react.createElement(
                            "td",
                            {
                                className: isThresh && track.skips >= thresh ? "auto-skip" : "",
                            },
                            track.skips
                        )
                    )
                )
            )
        );
    };

    const Config = ({ name, lkey }) => {
        const [value, setValue] = react.useState(Spicetify.LocalStorage.get(lkey));

        const setValueCallback = react.useCallback(
            (event) => {
                const value = event.target.value;
                setValue(value);
                Spicetify.LocalStorage.set(lkey, value);
            },
            [value]
        );

        const style = react.createElement("style", {
            dangerouslySetInnerHTML: {
                __html: `
.setting-row::after {
    content: "";
    display: table;
    clear: both;
}
.setting-row .col {
    padding: 16px 0 4px;
    align-items: center;
}
.setting-row .col.description {
    float: left;
    padding-right: 15px;
    cursor: default;
}
.setting-row .col.action {
    float: right;
    display: flex;
    justify-content: flex-end;
    align-items: center;
}
.col.action input {
    width: 100%;
    margin-top: 10px;
    padding: 0 5px;
    height: 32px;
    border: 0;
    color: var(--spice-text);
    background-color: initial;
    border-bottom: 1px solid var(--spice-text);
}
`,
            },
        });

        return react.createElement(
            "div",
            {
                className: "skip-stats-config-container",
            },
            style,
            react.createElement(
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
                        type: "number",
                        value,
                        onChange: setValueCallback,
                    })
                )
            )
        );
    };

    const currentSkips = new Spicetify.Menu.Item("See Skips for current playlist/album", false, async () => {
        const uriObj = Spicetify.URI.fromString(Spicetify.Player.data.context_uri);
        switch (uriObj.type) {
            case Spicetify.URI.Type.PLAYLIST:
            case Spicetify.URI.Type.PLAYLIST_V2:
            case Spicetify.URI.Type.ALBUM:
                await seeStats(Spicetify.Player.data.context_uri);
                break;
            default:
                throw Spicetify.showNotification("Unsupported context type! Please use for a playlist or an album only");
        }
    });

    const autoSkip = new Spicetify.Menu.Item("Auto-Skip", false, () => {
        Spicetify.PopupModal.display({
            title: "Auto-Skip Threshold",
            content: react.createElement(Config, { name: "Auto-Skip after this many skips (0 for off)", lkey: "autoSkipThreshold" }),
        });
    });

    const resetStatsAll = new Spicetify.Menu.Item("Reset all stats", false, () => {
        resetSkips("all");
    });

    const resetStatsCurrent = new Spicetify.Menu.Item("Reset stats for current track", false, () => {
        resetSkips("current");
    });

    new Spicetify.Menu.SubMenu("skipStats", [currentSkips, autoSkip, resetStatsAll, resetStatsCurrent]).register();

    new Spicetify.ContextMenu.Item(
        "See Skip Stats",
        async (uris) => {
            await seeStats(uris[0]);
        },
        (uris) => {
            if (uris.length > 1) {
                return false;
            }
            const uriObj = Spicetify.URI.fromString(uris[0]);
            switch (uriObj.type) {
                case Spicetify.URI.Type.PLAYLIST:
                case Spicetify.URI.Type.PLAYLIST_V2:
                case Spicetify.URI.Type.ALBUM:
                    // case Spicetify.URI.Type.COLLECTION:
                    return true;
            }
            return false;
        },
        "skip-forward"
    ).register();

    new Spicetify.ContextMenu.Item(
        "Reset Skips for this track",
        (uris) => {
            resetSkips("context", uris[0]);
        },
        (uris) => {
            if (uris.length != 1) return false;
            return Spicetify.URI.fromString(uris[0]).type == Spicetify.URI.Type.TRACK;
        }
    ).register();
})();
