/** main.js内容 **/
const electron = require('electron');
// 控制应用生命周期的模块
const {
    app,
    Menu,
    autoUpdater,
    dialog,
    ipcMain
} = require('electron')
// 创建本地浏览器窗口的模块
const {
    BrowserWindow
} = electron;

// 指向窗口对象的一个全局引用，如果没有这个引用，那么当该javascript对象被垃圾回收的
// 时候该窗口将会自动关闭
let win;

// 更新模块
let appName = '电梯云平台提示您：';
let appIcon = __dirname + '/images/icon.ico';
// 更新文件夹 
let updateUrl = 'http://192.168.0.105:777/';

// End生成快捷方式
const shouldQuit = app.makeSingleInstance((commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    if (win) {
        if (win.isMinimized()) win.restore()
        win.focus()
    }
})

function createWindow() {
    // 创建一个新的浏览器窗口
    win = new BrowserWindow({
        width: 9999,
        height: 9999,
        frame: true, //是否要边框
        minWidth: 1200,
        minHeight: 800,
        show: false,
        icon: "./icon.ico",
        title: "电梯云平台"
    });
    win.maximize() //窗口最大化
    // 加载远程页面
    // win.loadURL('http://www.yunguang-elevator.com');

    // 或加载本地HTML文件
    win.loadURL(`file://${__dirname}/dist/index.html`)

    // 打开开发工具页面
    win.webContents.openDevTools();

    // 当窗口关闭时调用的方法
    win.on('closed', () => {
        // 解除窗口对象的引用，通常而言如果应用支持多个窗口的话，你会在一个数组里
        // 存放窗口对象，在窗口关闭的时候应当删除相应的元素。
        win = null;
    });
    // 在加载页面时，渲染进程第一次完成绘制时，会发出 ready-to-show 事件 。 在此事件后显示窗口将没有视觉闪烁：
    win.once('ready-to-show', () => {
        win.show()
        win.focus();
    })




    // ipcMain.on('update', function (event, arg) {
    //     console.log(arg)
    //     event.sender.send('updateRed', arg)
    // })

    // win.webContents.on('did-finish-load', () => {
    //     win.webContents.send('ping', 'whoooooooh!')
    // })
    startupEventHandle();
    updateHandle();



    //自动更新
    function startupEventHandle() {
        if (require('electron-squirrel-startup')) return;
        var handleStartupEvent = function () {
            if (process.platform !== 'win32') {
                return false;
            }
            var squirrelCommand = process.argv[1];
            switch (squirrelCommand) {
                case '--squirrel-install':
                case '--squirrel-updated':
                    install();
                    return true;
                case '--squirrel-uninstall':
                    uninstall();
                    app.quit();
                    return true;
                case '--squirrel-obsolete':
                    app.quit();
                    return true;
            }
            // 安装
            function install() {
                var cp = require('child_process');
                var updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
                var target = path.basename(process.execPath);
                var child = cp.spawn(updateDotExe, ["--createShortcut", target], {
                    detached: true
                });
                child.on('close', function (code) {
                    app.quit();
                });
            }
            // 卸载
            function uninstall() {
                var cp = require('child_process');
                var updateDotExe = path.resolve(path.dirname(process.execPath), '..', 'update.exe');
                var target = path.basename(process.execPath);
                var child = cp.spawn(updateDotExe, ["--removeShortcut", target], {
                    detached: true
                });
                child.on('close', function (code) {
                    app.quit();
                });
            }
        };
        if (handleStartupEvent()) {
            return;
        }
    }

    function updateHandle() {
        let message = {
            error: '检查更新出错，第一次启动程序请忽略',
            checking: '正在检查更新……',
            updateAva: '检测到新版本，正在下载……',
            updateNotAva: '您目前使用的版本是最新版本',
        };
        const os = require('os');
        autoUpdater.setFeedURL(updateUrl);
        autoUpdater.on('error', function (error) {
                sendUpdateMessage(message.error)
            })
            .on('checking-for-update', function (e) {
                sendUpdateMessage(message.checking)
            })
            .on('update-available', function (e) {
                sendUpdateMessage(message.updateAva)
            })
            .on('update-not-available', function (e) {
                sendUpdateMessage(message.updateNotAva)
            })
            .on('update-downloaded', function (event, releaseNotes, releaseName, releaseDate, updateUrl, quitAndUpdate) {
                ipcMain.on('isUpdateNow', (e, arg) => {
                    //some code here to handle event
                    autoUpdater.quitAndInstall();
                })
                win.webContents.send('isUpdateNow')
            });

        //执行自动更新检查
        autoUpdater.checkForUpdates();
    }

    // 通过main进程发送事件给renderer进程，提示更新信息
    // win = new BrowserWindow()
    function sendUpdateMessage(text) {
        win.webContents.send('message', text)
    }
}
// 当Electron完成初始化并且已经创建了浏览器窗口，则该方法将会被调用。
// 有些API只能在该事件发生后才能被使用。
app.on('ready', createWindow);
// 当所有的窗口被关闭后退出应用
app.on('window-all-closed', () => {
    // 对于OS X系统，应用和相应的菜单栏会一直激活直到用户通过Cmd + Q显式退出
    if (process.platform !== 'darwin') {
        app.quit();
    }
});
app.on('activate', () => {
    // 对于OS X系统，当dock图标被点击后会重新创建一个app窗口，并且不会有其他
    // 窗口打开
    if (win === null) {
        createWindow();
    }
});