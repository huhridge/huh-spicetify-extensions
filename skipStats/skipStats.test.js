const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const test = require("node:test");
const vm = require("node:vm");

test("See Skip Stats loads playlist tracks through PlaylistAPI", async () => {
    const contextMenuItems = [];
    const storage = new Map([
        ["skipData", JSON.stringify({ "spotify:track:one": 3 })],
        ["autoSkipThreshold", "0"],
    ]);
    const playlistCalls = [];
    const modalCalls = [];

    class Item {
        constructor(name, callback) {
            this.name = name;
            this.callback = callback;
        }

        register() {
            contextMenuItems.push(this);
        }
    }

    const Spicetify = {
        React: {
            createElement: (type, props, ...children) => ({ type, props, children }),
            useCallback: (callback) => callback,
            useState: (value) => [value, () => {}],
        },
        ReactDOM: {},
        Platform: {
            PlaylistAPI: {
                getContents: async (uri) => {
                    playlistCalls.push(uri);
                    return {
                        items: [
                            {
                                uri: "spotify:track:one",
                                name: "One",
                                album: { name: "Album" },
                                artists: [{ name: "Artist" }],
                            },
                        ],
                    };
                },
            },
        },
        LocalStorage: {
            get: (key) => storage.get(key),
            set: (key, value) => storage.set(key, value),
        },
        Player: {
            addEventListener: () => {},
            getProgressPercent: () => 1,
        },
        URI: {
            Type: {
                PLAYLIST: "playlist",
                PLAYLIST_V2: "playlist-v2",
                ALBUM: "album",
                COLLECTION: "collection",
                TRACK: "track",
            },
            fromString: (uri) => ({ type: uri.startsWith("spotify:playlist:") ? "playlist" : "track" }),
        },
        CosmosAsync: {
            get: async (uri) => {
                throw new Error(`obsolete Cosmos request: ${uri}`);
            },
        },
        Menu: {
            Item: class {
                register() {}
            },
            SubMenu: class {
                register() {}
            },
        },
        ContextMenu: { Item },
        PopupModal: {
            display: (options) => modalCalls.push(options),
        },
        showNotification: () => {},
    };

    const source = fs.readFileSync(path.join(__dirname, "skipStats.js"), "utf8");
    vm.runInNewContext(source, { Spicetify, setInterval: () => {}, setTimeout });

    const seeStatsItem = contextMenuItems.find((item) => item.name === "See Skip Stats");
    assert.ok(seeStatsItem, "context-menu item should be registered");

    await seeStatsItem.callback(["spotify:playlist:test"]);

    assert.deepEqual(playlistCalls, ["spotify:playlist:test"]);
    assert.equal(modalCalls.length, 1);
});
