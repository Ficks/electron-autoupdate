var grunt = require('grunt');
grunt.config.init({
    pkg: grunt.file.readJSON('package.json'),
    'create-windows-installer': {
        x64: {
            authors: 'Ficks',
            projectUrl: 'http://www.yunguang-elevator.com',
            appDirectory: './app/yunguang-win32-x64',
            outputDirectory: './outApp/installer64',
            releaseNotes: 'yunguang',
            exe: 'yunguang.exe',
            description: '电梯云平台管理系统',
            setupIcon: "./main/images/icon.ico",
            setupExe: "setup.exe",
            iconUrl: "http://192.168.0.99:801/icon.ico",
            loadingGif: "./main/images/loading.gif",
            noMsi: true
        },
        // x32: {
        //     version: '1.0.0',
        //     authors: 'Ficks',
        //     projectUrl: 'http://www.yunguang-elevator.com',
        //     appDirectory: './app/myApp-win32-x64',
        //     outputDirectory: './installer32',
        //     releaseNotes: 'yikang keji app',
        //     exe: 'myApp.exe',
        //     description: '电梯云平台管理系统'
        // },
    }
})

grunt.loadNpmTasks('grunt-electron-installer')

grunt.registerTask('default', ['create-windows-installer']);