 module Controllers {

    export interface IImagePreviewerScope extends ng.IScope {
        Attachment: Models.Attachment;
        IsLoaded: boolean;

        Close($event: any): void;
    }

    export function ImagePreviewerController($scope: IImagePreviewerScope) {
        $scope.Close = ($event: any) => {
            if (!$event || $event.target.classList.contains("dialog-body")) {
                $scope.IsLoaded = false;
                $scope.Attachment = null;
            }
        };
    }
 }