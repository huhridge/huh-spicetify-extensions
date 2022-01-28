//@ts-check
// NAME: ListPlaylistsWithSong
// AUTHOR: huhridge (based on elijaholmos's version)
// DESCRIPTION: Adds context menu button to view playlists in your library that contain the selected song
/// <reference path="../globals.d.ts" />

(async function listPlaylistsWithSong() {
    const { Player, Menu, LocalStorage, Platform, React: react, ReactDOM: reactDOM } = Spicetify

    if (!(Player && Menu && LocalStorage && Platform)) {
        setTimeout(listPlaylistsWithSong, 1000)
        return
    }

    function delay(delayInms) {
        return new Promise(resolve => {
        setTimeout(() => {
            resolve(2);
        }, delayInms);
        });
    }

    // const user = await Spicetify.Platform.UserAPI.getUser()

    async function recursivePlaylistFolder(folder){ //to get every playlist no matter how deep, thanks to elijaholmos for reminding me, else i would have forgotten it.
        let playlists = [];
        for(const playlist of folder){
            if (playlist.type == 'playlist'){
                if ((playlist.isCollaborative || playlist.isOwnedBySelf) && playlist.totalLength > 0){
                    let image
                    try{
                        image = !(playlist.images[0]) ? ((await Spicetify.Platform.PlaylistAPI.getMetadata(playlist.uri)).images[0].url) :  playlist.images[0].url
                    }
                    catch{
                        image = ''
                    }
                    playlists.push({
                        uri: playlist.uri,
                        title: playlist.name,
                        desc: playlist.description,
                        isCollab: playlist.isCollaborative,
                        noOfSongs: playlist.totalLength,
                        created: playlist.addedAt.toLocaleString("default", { year: "numeric", month: "short", day:"numeric" }),
                        image: image
                    })
                }
            }
            else if (playlist.type == 'folder'){
                playlists.push(...(await recursivePlaylistFolder(playlist.items)))
            }
    
        }
        return playlists;
    }

    async function getUserLibrary(){
        let playlistsToCheck = Array();
        const userContents = await Spicetify.Platform.RootlistAPI.getContents()
        for(const playlist of userContents.items){
            if (playlist.type == 'playlist'){
                if ((playlist.isCollaborative || playlist.isOwnedBySelf) && playlist.totalLength > 0){
                    let image
                    try{
                        image = !(playlist.images[0]) ? ((await Spicetify.Platform.PlaylistAPI.getMetadata(playlist.uri)).images[0].url) :  playlist.images[0].url
                    }
                    catch{
                        image = ''
                    }
                    playlistsToCheck.push({
                        uri: playlist.uri,
                        title: playlist.name,
                        desc: playlist.description,
                        isCollab: playlist.isCollaborative,
                        noOfSongs: playlist.totalLength,
                        created: playlist.addedAt.toLocaleString("default", { year: "numeric", month: "short", day:"numeric" }),
                        image: image
                    })
                }
            }
            else if (playlist.type == 'folder'){
                playlistsToCheck.push(...(await recursivePlaylistFolder(playlist.items)))
            }
    
        }
        return playlistsToCheck;
    }

    async function checkPlaylist(playlist, songUri){
        var songFound =  false
        let addedAtDate;
        const tracks = await Spicetify.Platform.PlaylistAPI.getContents(playlist.uri)
        for (var i=0; i < tracks.items.length; i++){
            if (tracks.items[i].uri == songUri){
                songFound = true
                addedAtDate = tracks.items[i].addedAt.toLocaleString("default", { year: "numeric", month: "short", day:"numeric" })
                break
            }
        }
        if (songFound){
            playlist.index = i+1
            playlist.songAddedAt = addedAtDate
            return playlist
        }
        else{
            return false
        }
    }

    const playlistCard = ({playlist}) => {
        let isDesc = false
        if (playlist.desc){
            isDesc = true
        }
        return react.createElement(
            "div",
            {
                className: "contentSpacing main-entityHeader-container main-entityHeader-nonWrapped main-trackList-trackListHeaderRow",
                style: {
                    minHeight: "280px",
                    marginLeft: "2%",
                    marginRight: "2%",
                    justifyContent: "left",
                }
            },
            react.createElement(
                "div",
                {className: "main-entityHeader-imageContainer"},
                react.createElement(
                    "img",
                    {
                        className: "main-image-image",
                        src: playlist.image,
                        style: {
                            height: "inherit",
                        }
                    }
                ),

            ),
            react.createElement(
                "div",
                {className: "main-entityHeader-headerText"},
                react.createElement(
                    "h2",
                    {className: "main-entityHeader-subtitle main-entityHeader-small main-entityHeader-uppercase main-entityHeader-bold"},
                    playlist.isCollab ? "Collaborative Playlist" : "Playlist",
                ),
                react.createElement(
                    "h1",
                    {
                        className: "main-entityHeader-title main-type-bass",
                        style: {
                            padding: "0.08em 0px",
                            visibility: "visible",
                            width: "100%",
                            fontSize: "9vmin",
                            lineHeight: "9vmin",
                        }
                    },
                    react.createElement(
                        "a",
                        {
                            href: playlist.uri,
                            draggable: "false",
                        },
                        playlist.title
                    )

                ),
                isDesc && react.createElement(
                    "h2",
                    {className: "main-entityHeader-subtitle main-entityHeader-gray main-type-viola"},
                    playlist.desc,
                ),
                react.createElement(
                    "span",
                    {className: "main-entityHeader-metaData main-type-mesto"},
                    `${playlist.created} • ${playlist.noOfSongs} songs`,
                )
            )

        )

    }

    async function listPlaylists(uris){
        // getting playlists to display
        const allPlaylists = await getUserLibrary()
        const playlistsFound = []
        for (var playlist of allPlaylists){
            const playlistRes = await checkPlaylist(playlist, uris[0])
            if(playlistRes){
                playlistsFound.push(playlistRes)
            }
        }
        if (playlistsFound.length == 0){
            Spicetify.showNotification("Song is not in any of your playlists.")
            return
        }

        // getting song data to prepare elements
        const songmeta =  await Spicetify.CosmosAsync.get('https://api.spotify.com/v1/tracks/' + uris[0].split(':')[2]);
        Spicetify.Platform.History.push(`/album/${songmeta.album.uri.split(":")[2]}`)
        await delay(1100) // waiting to load.

        // modifying album page and saving info card and song row
        let songRow;
        let section = document.querySelector(`[data-testid="album-page"]`)
        if (songmeta.album.total_tracks == 1){
            songRow = document.querySelector(`[aria-rowindex="2"]`).cloneNode(true)
        }
        else{
            songRow = document.querySelector(`[aria-rowindex="3"]`).cloneNode(true)
            songRow.childNodes[0].childNodes[1].childNodes[0].childNodes[0].innerText = songmeta.name
            if (songmeta.artists.length > 1){
                let artists= "";
                for(const artist of songmeta.artists){
                    artists = artists.concat(artist.name, ", ")
                }
                artists = artists.slice(0, -2)
                if (songmeta.explicit){
                    songRow.childNodes[0].childNodes[1].childNodes[0].childNodes[2].innerHTML = artists
                }
                else{
                    songRow.childNodes[0].childNodes[1].childNodes[0].childNodes[1].innerHTML = artists
                }
            }

        }
        let info = document.querySelector(`[data-testid="album-page"] > div`).cloneNode(true)
        info.classList.add("main-trackList-trackListHeaderRow")
        section.innerHTML = "" //wiping all other elements

        await delay(200) // waiting for the topbar text to appear, to remove it
        document.querySelector(".main-topBar-topbarContent.main-entityHeader-topbarContent.main-entityHeader-topbarContentFadeIn").classList.remove("main-entityHeader-topbarContentFadeIn")
        
        section.appendChild(info)
        // creating the heading
        let appearsIn = document.createElement("h1")
        appearsIn.className = "main-type-bass main-trackList-trackListHeaderRow"
        appearsIn.style.fontSize = "48px"
        appearsIn.style.lineHeight = "60px"
        appearsIn.style.paddingLeft = "10px"
        appearsIn.innerText = `Appears In ${playlistsFound.length}/${allPlaylists.length} of your playlists:`
        section.appendChild(appearsIn) //adding it
        // modifying info card
        let infoText = section.childNodes[0].childNodes[5]
        infoText.childNodes[0].innerText = "SONG"
        infoText.childNodes[1].childNodes[0].style.fontSize =  "8vmin"
        infoText.childNodes[1].childNodes[0].style.lineHeight =  "8vmin"
        infoText.childNodes[1].childNodes[0].innerText = songmeta.name
        if (songmeta.album.total_tracks > 1) {
            let albumText = infoText.childNodes[0].cloneNode()
            albumText.classList.remove("main-entityHeader-uppercase", "main-entityHeader-small")
            albumText.style = "margin-top: 0px; margin-bottom: 8px"
            albumText.innerText = `Track ${songmeta.track_number} / ${songmeta.album.total_tracks} • ${songmeta.album.name}`
            infoText.childNodes[1].appendChild(albumText)
            infoText.childNodes[2].childNodes[2].innerText = `1 song, ${parseInt((songmeta.duration_ms/1000)/60)} min ${parseInt((songmeta.duration_ms/1000)%60)} sec`
        }
        
        // preparing song row element
        let songImage = document.createElement("img") //getting small album art and adding it
        songImage.className = "main-image-image main-trackList-rowImage"
        songImage.src = songmeta.album.images.at(-1).url
        songImage.width = 40
        songImage.height = 40
       
        songRow.childNodes[0].style = 'grid-template-columns: [index] 30px [first] 4fr [var1] 3fr [last] minmax(240px,2fr);'
        songRow.childNodes[0].childNodes[1].insertBefore(songImage, songRow.childNodes[0].childNodes[1].firstChild)
        songRow.childNodes[0].childNodes[2].childNodes[0].style.width = "fit-content"
        songRow.childNodes[0].childNodes[2].childNodes[0].innerText = songmeta.album.name
        songRow.childNodes[0].childNodes[3].childNodes[1].classList.remove("main-trackList-rowDuration")
        if (songRow.childNodes[0].classList.contains("main-trackList-active")){
            
            let spanIndex = document.createElement("span") //adding index in playlist to song row
            spanIndex.classList.add("main-trackList-number", "main-type-ballad")
            
            songRow.childNodes[0].childNodes[0].childNodes[0].childNodes[0].remove()
            songRow.childNodes[0].childNodes[0].childNodes[0].appendChild(spanIndex)
        }

        // finally rendering the playlists
        for(const playlist of playlistsFound){
            let preElement = document.createElement("div")
            preElement.classList.add("main-trackList-trackListHeaderRow")
            section.append(preElement)
           
            const playlist_card = react.createElement(playlistCard, {playlist: playlist})
            reactDOM.render(playlist_card, preElement)
            
            songRow.childNodes[0].childNodes[0].childNodes[0].childNodes[0].innerText = playlist.index
            songRow.childNodes[0].childNodes[3].childNodes[1].innerText = playlist.songAddedAt
            // finally adding song row
            preElement.appendChild(songRow.cloneNode(true)) 
        }
    }  
 
    new Spicetify.ContextMenu.Item(
        "List playlists with this Song",
        listPlaylists,
        (uris) => {
            if(uris.length != 1) return false;
            return Spicetify.URI.fromString(uris[0]).type == Spicetify.URI.Type.TRACK; 
        },
        "search"
    ).register();
    

})();

