var dmb;
(function (dmb) {
    var premiumEncounter;
    (function (premiumEncounter) {
        const READER = new FileReader();
        let creaturePictureInput;
        let creaturePictureDisplay;
        let creaturePictureFileInput;
        let creaturePictureInputOverlay;
        function Init() {
            creaturePictureInput = $("#creaturePictureInput");
            GetIsPremium();
            if (!premiumEncounter.IsPremium)
                return;
            creaturePictureDisplay = $("#creaturePictureDisplay");
            creaturePictureFileInput = $("#creaturePictureFileInput");
            creaturePictureInputOverlay = $("#creaturePictureOverlay");
            READER.addEventListener("load", () => {
                creaturePictureInput.attr("src", READER.result.toString());
                creaturePictureInput.show();
                creaturePictureInputOverlay.hide();
            });
        }
        premiumEncounter.Init = Init;
        function SetPictureFromUpload(input) {
            READER.readAsDataURL(input.files[0]);
        }
        premiumEncounter.SetPictureFromUpload = SetPictureFromUpload;
        function GetIsPremium() {
            premiumEncounter.IsPremium = creaturePictureInput.val() != null;
        }
        function SetPictureData(pictureData) {
            creaturePictureDisplay.attr("src", pictureData);
        }
        premiumEncounter.SetPictureData = SetPictureData;
        function GetPictureValue() {
            const creaturepicturedata = creaturePictureInput.attr("src");
            const approxsize = getSizeInBytes(creaturepicturedata);
            if (dmb.save.CanSave() && approxsize > 500000) {
                alert("Sorry, this image is too big to save (approximately " + approxsize + " bytes). We'll add your creature to the initiative, just without the image.");
                return "";
            }
            return creaturepicturedata;
        }
        premiumEncounter.GetPictureValue = GetPictureValue;
        function ClearPictureInput() {
            creaturePictureInput.attr("src", "");
            creaturePictureInput.hide();
            creaturePictureInputOverlay.show();
            creaturePictureFileInput.val('');
        }
        premiumEncounter.ClearPictureInput = ClearPictureInput;
        function SetNotesModalPicture(pictureData) {
            $("#creatureNotesModalPic").attr("src", pictureData);
        }
        premiumEncounter.SetNotesModalPicture = SetNotesModalPicture;
        const getSizeInBytes = obj => {
            let str = null;
            if (typeof obj === 'string') {
                // If obj is a string, then use it
                str = obj;
            }
            else {
                // Else, make obj into a string
                str = JSON.stringify(obj);
            }
            // Get the length of the Uint8Array
            const bytes = new TextEncoder().encode(str).length;
            return bytes;
        };
        const logSizeInBytes = (description, obj) => {
            const bytes = getSizeInBytes(obj);
            console.log(`${description} is approximately ${bytes} B`);
        };
    })(premiumEncounter = dmb.premiumEncounter || (dmb.premiumEncounter = {}));
})(dmb || (dmb = {}));
$(dmb.premiumEncounter.Init);
//# sourceMappingURL=premiumEncounter.js.map