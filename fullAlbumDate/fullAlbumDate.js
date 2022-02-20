(async function fullAlbumDate() {
    const { Player, Menu, LocalStorage, Platform } = Spicetify;

    async function getAlbumDate(uri) {
        const albumInfo = await Spicetify.CosmosAsync.get(`hm://album/v1/album-app/album/${uri}/desktop`);
        const albumDate = new Date(albumInfo.year, (albumInfo.month || 1) - 1, albumInfo.day || 0);
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
            document.querySelector(".main-entityHeader-divider.main-type-mesto") ?? document.querySelector(".main-entityHeader-metaData > span");
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
