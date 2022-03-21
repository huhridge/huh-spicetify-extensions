(async function fullAlbumDate() {
    const { Player, Menu, LocalStorage, Platform } = Spicetify;

    async function getAlbumDate(uri) {
        // const albumInfo = await Spicetify.CosmosAsync.get(`hm://album/v1/album-app/album/${uri}/desktop`); deprecated by spotify from 1.1.81
        const albumInfo = await Spicetify.CosmosAsync.get(`https://api.spotify.com/v1/albums/${uri}`);
        const albumDate = new Date(albumInfo.release_date);
        return albumDate.toLocaleString("default", { year: "numeric", month: "short", day: "numeric" });
    }

    if (!(Player && Menu && LocalStorage && Platform)) {
        setTimeout(fullAlbumDate, 1000);
        return;
    }

    function delay(delayInms) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(2);
            }, delayInms);
        });
    }

    function setDate(newDate) {
        const dateElement =
            document.querySelector(".main-entityHeader-divider.main-type-mesto") ??
            document.querySelector(".main-entityHeader-metaData span:nth-last-child(2)");
        dateElement.textContent = newDate;
    }

    if (Platform.History.location.pathname.startsWith("/album/")) {
        const uri = Platform.History.location.pathname.split("/")[2];
        const newDate = await getAlbumDate(uri);
        await delay(1000);
        setDate(newDate);
    }

    Platform.History.listen(async ({ pathname }) => {
        if (pathname.startsWith("/album/")) {
            const uri = pathname.split("/")[2];
            const newDate = await getAlbumDate(uri);
            await delay(1000);
            setDate(newDate);
        }
    });
})();
