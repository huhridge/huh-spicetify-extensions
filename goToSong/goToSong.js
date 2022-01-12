// @ts-check
// NAME: goToSong
// AUTHOR: huhridge
// DESCRIPTION: Go to currently playing song in playlists.
/// <reference path="../globals.d.ts" />

(function goToSong(){
    const { Player, Menu, LocalStorage, Platform, ContextMenu, URI, React: react, ReactDOM: reactDOM} = Spicetify
    let tracks, index, playlisturi, curruri;

    if (!(Player && Menu && LocalStorage && Platform)) {
        setTimeout(goToSong, 1000)
        return
    }

    function delay(delayInms) {
        return new Promise(resolve => {
        setTimeout(() => {
            resolve(2);
        }, delayInms);
        });
    }

    if (!Spicetify.LocalStorage.get("goToDelay")){
        Spicetify.LocalStorage.set("goToDelay", '200')
    }

    const ConfigInput = ({ name, lkey}) => {
        const [value, setValue] = react.useState(Spicetify.LocalStorage.get("goToDelay"));

        const setValueCallback = react.useCallback(
            (event) => {
                const value = event.target.value;
                setValue(value);
                Spicetify.LocalStorage.set(lkey, value)
            },
            [value]
        );
    
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
                    type: "number",
                    value,
                    onChange: setValueCallback,
                })
            )
        );
    };

    function shouldDisplayGoTo(uris) {
        if (uris.length > 1) {
            return false;
        }

        const uri = uris[0];
        const uriObj = Spicetify.URI.fromString(uri);
        if (uriObj.type == Spicetify.URI.Type.PLAYLIST || uriObj.type == Spicetify.URI.Type.PLAYLIST_V2) {
            return true;
        }
        return false;
    }

    async function scrollSong(playlisturi) {
        tracks = await Spicetify.Platform.PlaylistAPI.getContents(playlisturi)
        curruri = Spicetify.Player.data.track.uri
        for (var i=0; i < tracks.items.length; i++){
            if (tracks.items[i].uri == curruri){
                break;
            }
        }
        if (i == tracks.items.length){
            Spicetify.showNotification("Song not in Playlist.")
            return;
        }
        const playlisturl = '/playlist/' + playlisturi.split(':')[2]
        if (!(Spicetify.Platform.History.location.pathname == playlisturl)){
            Spicetify.Platform.History.push(playlisturl)
            await delay(1000)
        }
        if ((i+2)<58 && i == (tracks.items.length-1)){
            document.querySelector(`[aria-rowindex="${i+1}"]`).click()
            await delay(1)
            document.querySelector(`[aria-rowindex="${i+2}"]`).click()
            return;
        }
        if ((i+2)<58){
            document.querySelector(`[aria-rowindex="${i+2}"]`).click()
        }
        else{
            try {
                for (var j=57; j < tracks.items.length; j += 28){
                    document.querySelector(`[aria-rowindex="${j}"]`).click()
                    const delayms = Spicetify.LocalStorage.get('goToDelay')
                    await delay(Number(delayms))
                    if (Math.abs(j-(i+2)) < 28){
                        break
                    }
                }
                document.querySelector(`[aria-rowindex="${i+2}"]`).click()
            }
            catch(err){
                Spicetify.showNotification(err + '    Try to Adjust your delay in Profile > GoToSong > Set Delay')
            }

        }
    }

    async function gotoCurrPlay() { 
        if (Spicetify.Player.data.context_uri.startsWith('spotify:playlist:')){
            playlisturi = Spicetify.Player.data.context_uri
            await scrollSong(playlisturi)
        }
        else {
            Spicetify.showNotification('The song currently played is not part of a playlist.')            
        }
    }

    async function gotoselectedPlay(uris){    
        await scrollSong(uris[0])
    }

    let configContent = react.createElement(ConfigInput, {name: "Set Delay(in ms) (200 default)", lkey: "goToDelay"})


    const goTocurrPlay = new Spicetify.Menu.Item(
        "Go To Song in Playlist",
        false,
        gotoCurrPlay,
    )

    const goToConfig = new Spicetify.Menu.Item("Set Delay", false, () =>{
        Spicetify.PopupModal.display({
            title: "Set Delay",
            content: configContent,
        })
    })

    new Spicetify.Menu.SubMenu("GoToSong", [goTocurrPlay,goToConfig]).register();
    
    new Spicetify.ContextMenu.Item("Go To Currently Playing Song", gotoselectedPlay, shouldDisplayGoTo).register();

})();

