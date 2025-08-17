import { Component, Input, type OnInit } from '@angular/core'
import {
    DROPZONE_CONFIG,
    DropzoneConfigInterface,
    DropzoneModule,
} from 'ngx-dropzone-wrapper'
import { FormGroup } from '@angular/forms'
import {FileUploadService} from "./upload.service";



type UploadedFile = {
    name: string
    size: number
    type: string
    dataURL?: string
}



const DEFAULT_DROPZONE_CONFIG: DropzoneConfigInterface = {
    // Change this to your upload POST address:
    url: '/upload',
    maxFilesize: 50,
    acceptedFiles: 'image/*',
    autoProcessQueue: false,
    addRemoveLinks: true,
}



@Component({
    selector: 'app-file-uploader',
    standalone: true,
    imports: [DropzoneModule],
    template: ` <dropzone
class="dropzone"
[config]="dropzoneConfig"
[message]="dropzone"
(addedFile)="onFileAdded($event)"
(success)="onUploadSuccess($event)">

</dropzone>

@if (showPreview && uploadedFiles) {
<div class="dropzone-previews mt-3" id="file-previews">
@for (file of uploadedFiles; track $index) {
<div
class="card mt-1 mb-0 shadow-none border dz-processing dz-success dz-complete dz-image-preview">

<div class="p-2">
<div class="row align-items-center">
<div class="col-auto">
<img
data-dz-thumbnail=""
[src]="file.dataURL"
class="avatar-sm rounded bg-light"
alt="image"/>
</div>
<div class="col ps-0">
<a href="javascript:void(0);" class="text-muted fw-bold">{{
file.name
}}</a>
<p class="mb-0" data-dz-size="">
<strong>{{ file.size }}</strong> KB
</p>
</div>
<div class="col-auto">
<a
href="javascript:void(0);"
class="btn btn-link btn-lg text-dark"
(click)="removeFile($index)">

<i class="ti ti-x"></i>
</a>
</div>
</div>
</div>
</div>
}
</div>
}`,
    providers: [
        {
            provide: DROPZONE_CONFIG,
            useValue: DEFAULT_DROPZONE_CONFIG,
        },
    ],
})
export class FileUploaderComponent implements OnInit {
    @Input() showPreview = false
    @Input() form!: FormGroup;
    @Input() controlName = 'backgroundImage'; // default field name
    uploadedFiles: UploadedFile[] = []



    dropzoneConfig: DropzoneConfigInterface = {
        url: '/upload',
        maxFilesize: 50,
        clickable: true,
        addRemoveLinks: true,
        autoProcessQueue: false,
        acceptedFiles: 'image/*',
    }



    dropzone = `<div class="dz-message needsclick">
<i class="ri-upload-cloud-2-line h1 text-muted"></i>
<h3>Drop files here or click to upload.</h3>
<span class="text-muted fs-13">(This is just a demo dropzone. Selected files are
<strong>not</strong> actually uploaded.)</span>
</div>`

    constructor(
        private readonly fileUploadService: FileUploadService
    ) { }

    ngOnInit(): void {
        if (this.showPreview == true) {
            this.dropzoneConfig.previewsContainer = false
        }
    }
    // File Upload
    imageURL = ''
    onUploadSuccess(event: UploadedFile[]) {
        setTimeout(() => {
            this.uploadedFiles.push(event[0])
        }, 0)
    }

    onFileAdded(file: File): void {
        const appName = 'your-app-name'; // replace with dynamic value if needed

        this.fileUploadService.uploadFile(file, appName).subscribe({
            next: (response: any) => {
                console.log('Upload Success:', response);
                // Preview file (optional)
                const reader = new FileReader();
                reader.onload = (e: any) => {
                    const imageUrl = e.target.result;
                    console.log('Image:', e);
                    console.log('Image URL:', imageUrl);
                    // store/display preview if needed
                };
                reader.readAsDataURL(file);
                // Set value into the form control
                if (this.form && this.controlName) {
                    this.form.get(this.controlName)?.setValue(response.filePath);
                }
            },
            error: err => {
                console.error('Upload failed:', err);
            }
        });
    }

    // File Remove
    removeFile(index: number) {
        this.uploadedFiles.splice(index, 1);
        if (this.form && this.controlName) {
            this.form.get(this.controlName)?.setValue('');
        }
    }
}
