//@ts-check
// NAME: playlistIntersecter
// AUTHOR: huhridge
// DESCRIPTION: Adds context menu buttons to see songs in common between two playlists.
/// <reference types="react" />
/// <reference path="../globals.d.ts" />

(async function playlistIntersecter() {
    const { Player, Menu, LocalStorage, Platform, ReactDOM: reactDOM } = Spicetify
    let play1, play2, commonTracks;

    /** @type {React} */
    const react = Spicetify.React;

    if (!(Player && Menu && LocalStorage && Platform)) {
        setTimeout(playlistIntersecter, 1000)
        return
    }

    function delay(delayInms) {
        return new Promise(resolve => {
        setTimeout(() => {
            resolve(2);
        }, delayInms);
        });
    }

    function trackIntersection(track1 , track2) {
        var inter = new Array();
        var uri1 = new Array(); 

        for (i = 0; i < track1.length; i++){
            uri1.push(track1[i].uri);
        }
 
        for (var i = 0; i < track2.length; i++){
            var index1 = uri1.indexOf(track2[i].uri)
            if (index1 >= 0){
                track2[i].index1 = index1
                track2[i].index2 = i
                inter.push(track2[i])
            }
        }
        return inter
    }

    const playlistInfo = (playlist, isLeft) => {
        let isDesc = false
        if(playlist.description){
            isDesc = true
        }
        return react.createElement(
            "div",
            {
                className: "contentSpacing main-entityHeader-container main-entityHeader-nonWrapped",
                style: {
                    marginTop: "1.5%",
                    marginBottom: "1.5%",
                    justifyContent: isLeft ? "left" : "start",
                    paddingLeft : isLeft ? "32px" : "16px",
                    paddingRight: isLeft ? "16px" : "32px",
                    borderRight: isLeft ? "1px solid rgba(255,255,255,.1)" : ""
                }
            },
            react.createElement(
                "div",
                {   
                    draggable : false,
                    style: {
                        alignSelf: "center",
                        position: "relative",
                        height: "232px",
                        minWidth: "232px",
                        width: "232px",
                        marginInlineEnd: "24px",
    
                    }
                },
                react.createElement(
                    "img",
                    {
                        className: "main-image-image main-entityHeader-shadow",
                        style: {
                            height: "100%",
                            width: "100%"
                        },
                        src: playlist.images[0].url
                    }
                )
            ),
            react.createElement(
                "div",
                {
                    className: "main-entityHeader-headerText",
                    style: {
                        justifyContent : "center"
                    }
                },
                react.createElement(
                    "h2",
                    {
                        className: "main-entityHeader-subtitle main-entityHeader-small main-entityHeader-uppercase main-entityHeader-bold",
                    },
                    playlist.isCollaborative ? "Collaborative Playlist" : "Playlist",
                ),
                react.createElement(
                    "span",
                    {
                        className: "main-entityHeader-title"
                    },
                    react.createElement(
                        "h1",
                        {
                            dir: "auto",
                            className: "main-type-bass",
                            style: {
                                padding: "0.08em 0px",
                                visibility: "visible",
                                width: "100%",
                                lineHeight: "3vw"
                            },
                            ref : (el) => (el && el.style.setProperty("font-size", "2.5vw", "important"))
                        },
                        react.createElement(
                            "a",
                            {
                                href: playlist.uri,
                                draggable: "false",
                            },
                            playlist.name
                        ),
                    ),
                ),
                isDesc && react.createElement(
                    "h2",
                    {className: "main-entityHeader-subtitle main-entityHeader-gray main-type-viola"},
                    playlist.description,
                ),
                react.createElement(
                    "div",
                    {
                        className: "main-entityHeader-metaData"
                    },
                    react.createElement(
                        "span",
                        {
                            className: "main-type-mesto"
                        },
                        react.createElement(
                            "a",
                            {
                                href: playlist.owner.uri
                            },
                            playlist.owner.displayName,
                        ),
                        ` • ${playlist.totalLength} songs`
                    )
                )
            )
        )
    }

    const songRowHeader = () => {
        return react.createElement(
            "div",
            {
                className: "main-trackList-trackListRowGrid",
                role: "row",
                "aria-rowindex": "1",
                style: {
                    marginTop: "10px",
                    marginBottom: "8px"
                },
                ref : (el) => (el && el.style.setProperty("grid-template-columns", "[index] 1fr [first] 6fr [var1] 6fr [var2] 1fr [last] 1fr", "important"))
            },
            react.createElement(
                "div",
                {
                    className: "main-trackList-rowSectionIndex",
                    role: "columnheader",
                    "aria-colindex": "1"
                },
                '#'
            ),
            react.createElement(
                "div",
                {
                    className: "main-trackList-rowSectionStart",
                    role: "columnheader",
                    "aria-colindex": "2"
                },
                react.createElement(
                    "span",
                    {
                        className: "standalone-ellipsis-one-line main-type-minuet"
                    },
                    'title'
                )
            ),
            react.createElement(
                "div",
                {
                    className: "main-trackList-rowSectionVariable",
                    role: "columnheader",
                    "aria-colindex": "3"
                },
                react.createElement(
                    "span",
                    {
                        className: "standalone-ellipsis-one-line main-type-minuet"
                    },
                    'album'
                )
            ),
            react.createElement(
                "div",
                {
                    className: "main-trackList-rowSectionVariable",
                    role: "columnheader",
                    "aria-colindex": "4"
                },
                react.createElement(
                    "svg",
                    {
                        role: "img",
                        height: "16",
                        width: "16",
                        fill: "var(--spice-subtext)",
                        viewBox: "0 0 16 16"
                    },
                    react.createElement(
                        "path",
                        {
                            d: "M7.999 3h-1v5h3V7h-2V3zM7.5 0a7.5 7.5 0 100 15 7.5 7.5 0 000-15zm0 14C3.916 14 1 11.084 1 7.5S3.916 1 7.5 1 14 3.916 14 7.5 11.084 14 7.5 14z"
                        }
                    ),
                    react.createElement(
                        "path",
                        {
                            fill: "none",
                            d: "M16 0v16H0V0z"
                        }
                    )
                )
            ),
            react.createElement(
                "div",
                {
                    className: "main-trackList-rowSectionIndex",
                    role: "columnheader",
                    "aria-colindex": "5"
                },
                '#'
            ),
        )
    }

    const songRow = (song, songmeta, i, display='both') => {
        let artists = '' 
        for (const artist of song.artists){
            artists = artists.concat(artist.name , ', ')
        }
        let displayOne = true
        let displayTwo = true
        artists = artists.slice(0,-2)
        if (display == '1'){
            displayTwo = false
        }
        else if (display == '2'){
            displayOne = false
        }
        return react.createElement(
            "div",
            {
                className: "main-trackList-trackListRow main-trackList-trackListRowGrid",
                draggable: true,
                role: "presentation",
                "aria-rowindex": `${i}`,
                ref : (el) => (el && el.style.setProperty("grid-template-columns", "[index] 1fr [first] 6fr [var1] 6fr [var2] 1fr [last] 1fr", "important")),
                onDoubleClick: () => {
                    Spicetify.Player.playUri(song.uri)
                }
            },
            react.createElement(
                "div",
                {
                    className: "main-trackList-rowSectionStart",
                    role: "gridcell",
                    style: {
                        justifySelf : "end"
                    },
                    "aria-colindex": "1"
                },
                displayOne && react.createElement(
                    "div",
                    {
                        className: "main-trackList-rowMarker",
                    },
                    react.createElement(
                        "span",
                        {
                            className: "main-trackList-number main-type-ballad"
                        },
                        (song.index1 + 1),
                    )
                )
            ),
            react.createElement(
                "div",
                {
                    className: "main-trackList-rowSectionStart",
                    role: "gridcell",
                    "aria-colindex": "2"
                },
                react.createElement(
                    "img",
                    {
                        className: "main-image-image main-trackList-rowImage",
                        draggable: false,
                        width: "40",
                        height: "40",
                        src: songmeta.album.images.at(-1).url
                    }
                ),
                react.createElement(
                    "div",
                    {
                        className: "main-trackList-rowMainContent"
                    },
                    react.createElement(
                        "div",
                        {
                            className: "main-trackList-rowTitle standalone-ellipsis-one-line main-type-ballad",
                            dir: "auto"
                        },
                        song.name,
                    ),
                    song.isExplicit && react.createElement(
                        "span",
                        {
                            className: "main-trackList-rowBadges main-type-ballad",
                            style: {
                                color: "var(--spice-subtext)"
                            }
                        },
                        react.createElement(
                            "span",
                            {
                                className: "main-tag-container",
                                title: "Explicit"
                            },
                            'E',
                        )
                    ),
                    react.createElement(
                        "span",
                        {
                            className: "main-trackList-rowSubTitle standalone-ellipsis-one-line main-type-mesto",
                            style: {
                                color: "var(--spice-subtext)"
                            }
                        },
                        artists
                    )
                )

            ),
            react.createElement(
                "div",
                {
                    className: "main-trackList-rowSectionVariable",
                    role: "gridcell",
                    "aria-colindex": "3"
                },
                react.createElement(
                    "a",
                    {
                        draggable: true,
                        className: "standalone-ellipsis-one-line main-type-mesto",
                        href: song.album.uri
                    },
                    song.album.name
                )
            ),
            react.createElement(
                "div",
                {
                    className: "main-trackList-rowSectionVariable",
                    role: "gridcell",
                    "aria-colindex": "4"
                },
                react.createElement(
                    "span",
                    {
                        className: "main-type-mesto",
                        style: {
                            color: "var(--spice-subtext)"
                        }
                    },
                    `${parseInt((songmeta.duration_ms/1000)/60)}:${(parseInt((songmeta.duration_ms/1000)%60)).toLocaleString(undefined, {minimumIntegerDigits: 2, useGrouping:false})}`
                )
            ),
            react.createElement(
                "div",
                {
                    className: "main-trackList-rowSectionEnd",
                    role: "gridcell",
                    "aria-colindex": "5",
                    style: {
                        justifyContent: "end"
                    }
                },
                displayTwo && react.createElement(
                    "div",
                    {
                        className: "main-trackList-rowMarker",
                    },
                    react.createElement(
                        "span",
                        {
                            className: "main-trackList-number main-type-ballad"
                        },
                        (song.index2 + 1),
                    )
                )
            )
        )  
    }

    const interHeading = () => {
        return react.createElement(
            "div",
            {
                className: "interHeading",
                style: {
                    display: "flex",
                    justifyContent: "flex-start",
                    borderBottom: "1px solid rgba(255,255,255,.1)",
                },
            },
            react.createElement(
                "h1",
                {
                    className: "main-type-bass main-trackList-trackListHeaderRow",
                    style: {
                        fontSize: "30px",
                        lineHeight: "60px",
                        paddingLeft: "10px",
                        justifySelf: "flex-start",
                        border: "none"
                    }
                },
            ),
            react.createElement(
                "button",
                {
                    className: "changeMode main-topBar-button",
                    title: "Change Mode",
                    style: {
                        
                        display: "inline-flex",
                        alignSelf: "center",
                        width: "32px",
                        height: "32px",
                        marginLeft: "auto",
                        marginRight: "16px",
                        borderWidth: "0px",
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: "var(--spice-button)"

                    },
                    onClick: () =>{
                        let ele = document.querySelector(".changeMode.main-topBar-button")
                        if (LocalStorage.get("spicetify-intermode") == "Intersect" && Spicetify.LocalStorage.get("spicetify-interorder") == "0"){
                            LocalStorage.set("spicetify-intermode", "exceptIntersect")
                            Spicetify.LocalStorage.set("spicetify-interorder", "1")
                            ele.style.backgroundColor = "var(--spice-button-active)"
                            let d = ele.firstChild.firstChild.getAttribute('d')
                            d = d + "M4.318 10.836A.5.5 0 006.089 11.548.5.5 0 004.318 10.836Z"
                            ele.firstChild.firstChild.setAttribute('d', d)
                            exceptIntersect()
                        }
                        else if (LocalStorage.get("spicetify-intermode") == "exceptIntersect" && Spicetify.LocalStorage.get("spicetify-interorder") == "1"){
                            Spicetify.LocalStorage.set("spicetify-interorder", "2")
                            ele.firstChild.innerHTML = Spicetify.SVGIcons.copy
                            let d = ele.firstChild.firstChild.getAttribute('d')
                            d = d + "M10.423 3.806A.5.5 0 0011.411 5.234.5.5 0 0010.423 3.806Z"
                            ele.firstChild.firstChild.setAttribute('d', d)
                            exceptIntersect()
                        }
                        else{
                            LocalStorage.set("spicetify-intermode", "Intersect")
                            Spicetify.LocalStorage.set("spicetify-interorder", "0")
                            ele.firstChild.innerHTML = Spicetify.SVGIcons.copy
                            ele.style.backgroundColor = "var(--spice-button)"
                            renderIntersect()
                        }
                    }
                },
                react.createElement(
                    "svg",
                    {
                        role: "img",
                        width: "16",
                        height: "16",
                        fill: "black",
                        viewBox: "0 0 16 16",
                        class: "modeSVG",
                        dangerouslySetInnerHTML: {
                            __html: Spicetify.SVGIcons.copy
                        }
                    }
                )
            )
        )
    }


    async function intersect() {
        play1 = LocalStorage.get("spicetify-interplaylist1")
        play2 = LocalStorage.get("spicetify-interplaylist2")
        LocalStorage.set("spicetify-intermode", "Intersect")
        LocalStorage.set("spicetify-interorder", "0")
        LocalStorage.remove("spicetify-interplaylist1")
        LocalStorage.remove("spicetify-interplaylist2")

        const tracks1 = (await Spicetify.Platform.PlaylistAPI.getContents(play1)).items
        const tracks2 = (await Spicetify.Platform.PlaylistAPI.getContents(play2)).items

        commonTracks = trackIntersection(tracks1, tracks2)

        if (commonTracks.length == 0){
            Spicetify.showNotification("No common tracks between the playlists.")
            return
        }

        const meta1 = await Spicetify.Platform.PlaylistAPI.getMetadata(play1)
        const meta2 = await Spicetify.Platform.PlaylistAPI.getMetadata(play2)

        Spicetify.Platform.History.push(`/playlist/${meta1.uri.split(":")[2]}`)
        await delay(1000)
        
        let section = document.querySelector(`[data-testid="playlist-page"]`)
        section.innerHTML = ''
        
        await delay(200) // waiting for the topbar text to appear, to remove it
        document.querySelector(".main-topBar-topbarContent.main-entityHeader-topbarContent.main-entityHeader-topbarContentFadeIn").classList.remove("main-entityHeader-topbarContentFadeIn")
        
        let playContainer = document.createElement("div")
        playContainer.classList.add("main-trackList-trackListHeaderRow")
        playContainer.style.display = "flex"
        playContainer.style.borderBottom = "1px solid rgba(255,255,255,.1)"
        section.append(playContainer)

        const playele1 = playlistInfo(meta1, true)
        const playele2 = playlistInfo(meta2, false)

        let container = document.querySelector('.main-trackList-trackListHeaderRow')
        let preElement1 = document.createElement("div")
        preElement1.style.width = "50%"
        container.append(preElement1)
        reactDOM.render(playele1, preElement1)
        let preElement2 = document.createElement("div")
        preElement2.style.width = "50%"
        container.append(preElement2)
        reactDOM.render(playele2, preElement2)

        let headingWrapper = document.createElement("div")
        section.append(headingWrapper)
        let heading = interHeading()
        reactDOM.render(heading, headingWrapper)

        let songHeader = document.createElement("div")
        songHeader.className = "main-trackList-trackListHeaderRow"
        songHeader.style.background = "var(--spice-main)"
        songHeader.style.borderBottom = "1px solid rgba(255,255,255,.1)"
        songHeader.style.marginBottom = "8px"
        songHeader.style.position = "sticky"
        songHeader.style.top = "64px"
        songHeader.style.zIndex = "2"
        section.append(songHeader)
        const trackRowHeader = await songRowHeader()
        reactDOM.render(trackRowHeader, songHeader)
        renderIntersect()
    }

    async function renderIntersect(){
        let section = document.querySelector(`[data-testid="playlist-page"]`)
        //resetting order
        // let span = document.querySelector(".interOrder")
        // span.innerText = "1"
        let songContainer;
        try{
            songContainer = document.querySelector(".interSongContainer")
            songContainer.innerHTML = ""
        }
        catch{
            songContainer = document.createElement("div")
            songContainer.className = "interSongContainer"
            section.append(songContainer)
        }
        let heading1 = document.querySelector(".main-type-bass.main-trackList-trackListHeaderRow")
        if (commonTracks.length == 1){
            heading1.innerText =  `${commonTracks.length} song appears in both of the playlists: `
        }
        else{
            heading1.innerText = `${commonTracks.length} songs appear in both of the playlists: `
        }
        //rendering songs
        let i = 2
        for (const track of commonTracks){
            let preElement = document.createElement("div")
            songContainer.append(preElement)
            const songmeta =  await Spicetify.CosmosAsync.get('https://api.spotify.com/v1/tracks/' + track.uri.split(':')[2]);
            const trackRow = songRow(track, songmeta, i)
            reactDOM.render(trackRow, preElement)
            i += 1
        }
    }

    async function exceptIntersect() {
        const toDisplay = LocalStorage.get("spicetify-interorder")
        let tracks = []
        let isOne, meta
        if (toDisplay == "1"){
            tracks = (await Spicetify.Platform.PlaylistAPI.getContents(play1)).items
            meta = await Spicetify.Platform.PlaylistAPI.getMetadata(play1)
            for (var i=0; i<tracks.length; i++){
                tracks[i].index1 = i
            }
            isOne = true
        }
        else{
            tracks = (await Spicetify.Platform.PlaylistAPI.getContents(play2)).items
            meta = await Spicetify.Platform.PlaylistAPI.getMetadata(play2)
            for (var i=0; i<tracks.length; i++){
                tracks[i].index2 = i
            }
            isOne = false
        }  
        for (const track of commonTracks){
            isOne ? delete tracks[track.index1] : delete tracks[track.index2]
        }
        let heading = document.querySelector(".main-type-bass.main-trackList-trackListHeaderRow")
        if (tracks.length == 1){
            heading.innerText =  `${tracks.length} song exists only in ${meta.name}`
        }
        else{
            heading.innerText = `${tracks.length-commonTracks.length} songs exist only in ${meta.name}`
        }

        let container = document.querySelector(".interSongContainer")
        container.innerHTML = ""

        let j = 2
        for (const track of tracks){
            if(!track){
                continue
            }
            let preElement = document.createElement("div")
            container.append(preElement)
            const songmeta =  await Spicetify.CosmosAsync.get('https://api.spotify.com/v1/tracks/' + track.uri.split(':')[2]);
            const trackRow = songRow(track, songmeta, j, toDisplay)
            reactDOM.render(trackRow, preElement)
            j += 1
        }

    }

    const clearSelection = new Spicetify.Menu.Item("Clear Selection from Intersection" ,false, (self) => {
        LocalStorage.remove("spicetify-interplaylist1")
        self.deregister()
    })

    new Spicetify.ContextMenu.Item("Select for Intersection", 
        (uris) => {
        LocalStorage.set("spicetify-interplaylist1", uris[0])
        clearSelection.register()
        }, 
        (uris) => {
            if (uris.length > 1) {
                return false;
            }
            if (LocalStorage.get("spicetify-interplaylist1")){
                return false
            }
            const uriObj = Spicetify.URI.fromString(uris[0]);
            if (uriObj.type == Spicetify.URI.Type.PLAYLIST || uriObj.type == Spicetify.URI.Type.PLAYLIST_V2) {
                return true;
            }
            return false;
        },
        "copy"
    ).register()

    new Spicetify.ContextMenu.Item("Compare with Selected Playlist", 
        (uris) => {
        LocalStorage.set("spicetify-interplaylist2", uris[0])
        clearSelection.deregister()
        intersect()
        },
        (uris) => {
            if (uris.length > 1) {
                return false;
            }
            if (!LocalStorage.get("spicetify-interplaylist1")){
                return false
            }
            if(uris[0] == LocalStorage.get("spicetify-interplaylist1")){
                return false
            }
            const uriObj = Spicetify.URI.fromString(uris[0]);
            if (uriObj.type == Spicetify.URI.Type.PLAYLIST || uriObj.type == Spicetify.URI.Type.PLAYLIST_V2) {
                return true;
            }
            return false;
        },
        "copy"
    ).register()

})()