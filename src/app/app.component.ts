import { Component, ElementRef } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { ViewChild } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  @ViewChild('myInput') myInputVariable: ElementRef | undefined;
  title = 'firebase-host-test';
  targetFile: File | null = null;
  fileList: string[] = [];
  constructor(private storage: AngularFireStorage) {}

  onfileSelected(event: Event) {
    const target = event.target as HTMLInputElement;
    const files = target.files as FileList;
    this.targetFile = files[0];
  }
  async uploadFile() {
    try {
      const file = this.targetFile;
      const filePath = '/angularTest1/' + file?.name || 'noname';

      const ref = this.storage.ref(filePath);
      const storeTask = ref.put(file);

      storeTask.then(async (uploadResult) => {
        if (this.myInputVariable) this.myInputVariable.nativeElement.value = '';

        const url = await ref.getDownloadURL();
        url.subscribe((res) => {
          console.log(
            '🚀 ~ file: app.component.ts ~ line 35 ~ AppComponent ~ uploadFile ~ res',
            { res, storage: this.storage }
          );
        });

        const refFolder = this.storage.ref('/angularTest1');

        refFolder.listAll().subscribe(async (res) => {
          const items = (await Promise.all(
            res.items.map(async (item) => {
              const ref = this.storage.ref(item.fullPath);
              return await new Promise((resolve) => {
                ref.getDownloadURL().subscribe((url) => {
                  resolve(url);
                });
              });
            })
          )) as string[];

          this.fileList = items;

          console.log(
            '🚀 ~ file: app.component.ts ~ line 48 ~ AppComponent ~ items ~ items',
            { fullpaths: items, names: res.items.map((item) => item.fullPath) }
          );
        });
      });
    } catch (error) {
      console.log(
        '🚀 ~ file: app.component.ts ~ line 44 ~ AppComponent ~ uploadFile ~ error',
        error
      );
    }
  }
}
