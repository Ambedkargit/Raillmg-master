import { Injectable, TemplateRef } from '@angular/core';

export interface Toast {
    template: String;
    classname?: string;
    delay?: number;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
    
    toasts: Toast[] = [];

    // showAlert(template: string) {
    //     this.toasts.push({ template, classname: 'bg-alert text-light', delay: 5000 });
    // }

    remove(toast) {
        this.toasts = this.toasts.filter((t) => t !== toast);
    }

    clear() {
        this.toasts.splice(0, this.toasts.length);
    }

    showSuccess(template: String) {
        this.toasts.push({ template, classname: 'bg-success text-light', delay: 5000 });
    }

    showDanger(template: String) {
        this.toasts.push({ template, classname: 'bg-danger text-light', delay: 5000 });
    }

    showWarning(template: String) {
        this.toasts.push({ template, classname: 'bg-warning text-success', delay: 5000 });
    }


}
