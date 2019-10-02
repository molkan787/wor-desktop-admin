const request = require('request');

class Updater {

    static init(){
        this.busy = false;
        this.notifyWasShown = false;
    }

    static checkVersion(data){
        const version = parseInt(data.adminDesktop || 0);
        if(version > config.appVersion){
            this.updateAvailable(version);
        }
    }

    static updateAvailable(latestVersion){
        if(this.notifyWasShown){
            setTimeout(() => this.notifyWasShown = false, 1000 * 60 * 60 * 2); // 2 Hours
            return;
        }
        this.notifyWasShown = true;
        NotifyPan.show({
            data: {
                title: 'An update is available',
                content: 'A new version of WalkOn Retail Administration app is available.',
                okButton: 'Update Now'
            }
        })
        .then(() => this.update(latestVersion))
        .catch(err => err);
    }

    static async update(latestVersion){
        if(this.busy) return;
        this.busy = true;
        
        const filename = 'desktop-admin-' + latestVersion + '.exe';
        const dl = dm.FILES_DL_BASE + filename;
        await this._download(dl, filename);
        await NotifyPan.show({
            data: {
                title: 'Update is ready to install',
                content: 'You need to restart the software in order to install the update.',
                okButton: 'Restart Now'
            }
        })
        await sleep(1000);
        this._startUpdate(filename);
    }

    static async _download(uri, filename){
        try {
            showElt('update_progress');
            await downloadFile(uri, filename, p => this._showProgress(p));
            hideElt('update_progress');
            console.log(`The file is finished downloading.`);
        } catch (error) {
            console.error(error);
        }
    }

    static _startUpdate(filename){
        const filepath = process.cwd() + '\\' + filename;
        const spawn = require('child_process').spawn;
        const child = spawn(filepath, [], {
            detached: true,
            cleanup: false,
            stdio: ['ignore']
        });
        child.unref();
        quit();
        console.log('Executed ' + filepath)
    }

    static _showProgress(percent){
        if(percent != 100 && this.lastPU){
            if(millis() - this.lastPU < 200) return;
        }
        this.lastPU = millis();
        val('update_progress_text', 'Downloading ' + percent + '%');
    }

}

Updater.init();