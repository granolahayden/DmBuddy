var dmb;
(function (dmb) {
    var premiumEncounter;
    (function (premiumEncounter) {
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
            creaturePictureFileInput.on('input', function (event) {
                const input = document.querySelector('input[type=file]');
                const reader = new FileReader();
                reader.addEventListener("load", () => {
                    // convert image file to base64 string
                    creaturePictureInput.attr("src", reader.result.toString());
                    creaturePictureInput.show();
                    creaturePictureInputOverlay.hide();
                }, false);
                if (input) {
                    reader.readAsDataURL(input.files[0]);
                }
            });
        }
        premiumEncounter.Init = Init;
        function GetIsPremium() {
            premiumEncounter.IsPremium = creaturePictureInput.val() != null;
        }
        function SetPictureData(pictureData) {
            creaturePictureDisplay.attr("src", pictureData);
        }
        premiumEncounter.SetPictureData = SetPictureData;
        function GetPictureValue() {
            return creaturePictureInput.attr("src");
        }
        premiumEncounter.GetPictureValue = GetPictureValue;
        function ClearPictureInput() {
            creaturePictureInput.attr("src", "");
            creaturePictureInput.hide();
            creaturePictureInputOverlay.show();
            creaturePictureFileInput.val('');
        }
        premiumEncounter.ClearPictureInput = ClearPictureInput;
    })(premiumEncounter = dmb.premiumEncounter || (dmb.premiumEncounter = {}));
})(dmb || (dmb = {}));
$(document).ready(function () {
    dmb.premiumEncounter.Init();
});
//# sourceMappingURL=premiumEncounter.js.map