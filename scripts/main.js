import {  world , system, BlockPermutation} from "@minecraft/server";
let startVector = new Map()
let endVector = new Map()
let degrees = new Map()
let featherBlock = new Map()
const airBlock = BlockPermutation.resolve('minecraft:air')
const sandBlock = BlockPermutation.resolve('minecraft:sand')
const unknownBlock = BlockPermutation.resolve('minecraft:unknown')

world.afterEvents.blockBreak.subscribe((ev)=>{
    if(!ev.player.hasTag(`WorldEdit`)) return; 
    if(typeof ev.player.getComponent(`inventory`).container.getItem(ev.player.selectedSlot) === 'undefined') return
    if(ev.player.getComponent(`inventory`).container.getItem(ev.player.selectedSlot).typeId === `karo:we_axe`){
        ev.dimension.fillBlocks(ev.block.location,ev.block.location,ev.brokenBlockPermutation)
        startVector.set(ev.player.name ,`${ev.block.location.x} ${ev.block.location.y} ${ev.block.location.z}`)
        ev.player.sendMessage(`§a始点座標を (${startVector.get(ev.player.name)}) にしました`)
    }
    if(ev.player.getComponent(`inventory`).container.getItem(ev.player.selectedSlot).typeId === `karo:we_feather`){
        featherBlock.set(ev.player.name,ev.brokenBlockPermutation)
        ev.dimension.fillBlocks(ev.block.location,ev.block.location,ev.brokenBlockPermutation)
    }
    if(ev.player.getComponent(`inventory`).container.getItem(ev.player.selectedSlot).typeId === `karo:we_info`){
        ev.player.sendMessage(`§b${ev.brokenBlockPermutation.getItemStack().typeId.split(`:`)[1]}`)
        ev.dimension.fillBlocks(ev.block.location,ev.block.location,ev.brokenBlockPermutation)
    }
    if(ev.player.getComponent(`inventory`).container.getItem(ev.player.selectedSlot).typeId === `minecraft:shears`){
        ev.player.getComponent(`inventory`).container.addItem(ev.brokenBlockPermutation.clone().getItemStack())
        ev.dimension.fillBlocks(ev.block.location,ev.block.location,ev.brokenBlockPermutation)
    }
})

world.beforeEvents.itemUseOn.subscribe(async ev => {
    const { itemStack, source, block } = ev;
    if(!source.hasTag(`WorldEdit`)) return; 
    if ( itemStack.typeId === "karo:we_shears" ) {
      ev.cancel = true;
      await null
      if(ev.source.hasTag(`copy`)) return;
      source.addTag(`copy`)
      const stack = block.getItemStack(1, true);
      const { container } = /** @type {Inventory} */ (source.getComponent('minecraft:inventory'));
      container.addItem(stack);
    }
});

world.afterEvents.itemStopUseOn.subscribe((ev)=>{
    ev.source.removeTag(`copy`)
})

world.afterEvents.itemUse.subscribe((ev)=>{
    if(!ev.source.hasTag(`WorldEdit`)) return; 
    if(typeof ev.source.getBlockFromViewDirection() === 'undefined' || typeof ev.source.getComponent(`inventory`).container.getItem(ev.source.selectedSlot) === 'undefined') return;
    const playerViewLocation = {x: ev.source.getBlockFromViewDirection().block.location.x,y: ev.source.getBlockFromViewDirection().block.location.y,z: ev.source.getBlockFromViewDirection().block.location.z}
    if(ev.source.getComponent(`inventory`).container.getItem(ev.source.selectedSlot).typeId === `karo:we_axe`){
        endVector.set(ev.source.name ,`${playerViewLocation.x} ${playerViewLocation.y} ${playerViewLocation.z}`)
        ev.source.sendMessage(`§a終点座標を (${endVector.get(ev.source.name)}) にしました`)
    }
    if(ev.source.getComponent(`inventory`).container.getItem(ev.source.selectedSlot).typeId === `karo:we_feather`){
        world.getDimension(`overworld`).fillBlocks(ev.source.getBlockFromViewDirection().block.location,ev.source.getBlockFromViewDirection().block.location,featherBlock.get(ev.source.name))
    }
    if(ev.source.getComponent(`inventory`).container.getItem(ev.source.selectedSlot).typeId === `karo:we_airblock`){
        world.getDimension(`overworld`).fillBlocks({x: ev.source.location.x,y: ev.source.location.y - 1,z: ev.source.location.z},{x: ev.source.location.x,y: ev.source.location.y - 1,z: ev.source.location.z},BlockPermutation.resolve(`minecraft:glass`))
    }
    if(ev.source.getComponent(`inventory`).container.getItem(ev.source.selectedSlot).typeId === `karo:we_shovel`){
        world.getDimension(`overworld`).fillBlocks({x: playerViewLocation.x + 1,y: playerViewLocation.y + 2,z: playerViewLocation.z + 1},{x: playerViewLocation.x - 1,y: playerViewLocation.y - 2,z: playerViewLocation.z - 1},sandBlock,{matchingBlock:airBlock})
        world.getDimension(`overworld`).fillBlocks({x: playerViewLocation.x + 2,y: playerViewLocation.y + 1,z: playerViewLocation.z + 1},{x: playerViewLocation.x - 2,y: playerViewLocation.y - 1,z: playerViewLocation.z - 1},sandBlock,{matchingBlock: airBlock})
        world.getDimension(`overworld`).fillBlocks({x: playerViewLocation.x + 1,y: playerViewLocation.y + 1,z: playerViewLocation.z + 2},{x: playerViewLocation.x - 1,y: playerViewLocation.y - 1,z: playerViewLocation.z - 2},sandBlock,{matchingBlock: airBlock})    
    }
    if(ev.source.getComponent(`inventory`).container.getItem(ev.source.selectedSlot).typeId === `karo:we_brush`){
        world.getDimension(`overworld`).fillBlocks({x: playerViewLocation.x + 1,y: playerViewLocation.y + 2,z: playerViewLocation.z + 1},{x: playerViewLocation.x - 1,y: playerViewLocation.y - 2,z: playerViewLocation.z - 1},unknownBlock,{matchingBlock:airBlock})
        world.getDimension(`overworld`).fillBlocks({x: playerViewLocation.x + 2,y: playerViewLocation.y + 1,z: playerViewLocation.z + 1},{x: playerViewLocation.x - 2,y: playerViewLocation.y - 1,z: playerViewLocation.z - 1},unknownBlock,{matchingBlock: airBlock})
        world.getDimension(`overworld`).fillBlocks({x: playerViewLocation.x + 1,y: playerViewLocation.y + 1,z: playerViewLocation.z + 2},{x: playerViewLocation.x - 1,y: playerViewLocation.y - 1,z: playerViewLocation.z - 2},unknownBlock,{matchingBlock: airBlock})
    }
})

world.beforeEvents.chatSend.subscribe((ev)=>{
    if(ev.message.startsWith(`\\\\`)) ev.sendToTargets = true
})

world.afterEvents.chatSend.subscribe((ev)=>{
    if(!ev.sender.hasTag(`WorldEdit`)) return; 
    if(ev.message.startsWith(`\\\\`)) {
        let minZahyo = []
        if(typeof startVector.get(ev.sender.name) !== 'undefined' && typeof endVector.get(ev.sender.name) !== 'undefined') {
            let number1_string = startVector.get(ev.sender.name).split(` `)
            let number2_string = endVector.get(ev.sender.name).split(` `)
            for(let i = 0;i < 3;i++){
                if(Number(number1_string[i]) < Number(number2_string[i])) minZahyo[minZahyo.length] = Number(number1_string[i])
                if(Number(number1_string[i]) > Number(number2_string[i])) minZahyo[minZahyo.length] = Number(number2_string[i])
            }
        }
        if(ev.message.startsWith(`\\\\copy`)) {
            if(typeof startVector.get(ev.sender.name) === 'undefined' || typeof endVector.get(ev.sender.name) === 'undefined') {
                ev.sender.sendMessage(`§c範囲を選択できていません。`)
                return;
            }
            ev.sender.runCommandAsync(`structure save "${ev.sender.name}" ${startVector.get(ev.sender.name)} ${endVector.get(ev.sender.name)}`)
            ev.sender.sendMessage(`§a(${startVector.get(ev.sender.name)}) から (${endVector.get(ev.sender.name)}) をコピーしました`)
        }
        if(ev.message.startsWith(`\\\\cut`)) {
            if(typeof startVector.get(ev.sender.name) === 'undefined' || typeof endVector.get(ev.sender.name) === 'undefined') {
                ev.sender.sendMessage(`§c範囲を選択できていません。`)
                return;
            }
            ev.sender.runCommandAsync(`structure save "${ev.sender.name}" ${startVector.get(ev.sender.name)} ${endVector.get(ev.sender.name)}`)
            ev.sender.runCommandAsync(`fill ${startVector.get(ev.sender.name)} ${endVector.get(ev.sender.name)} air`)
            ev.sender.sendMessage(`§a(${startVector.get(ev.sender.name)}) から (${endVector.get(ev.sender.name)}) を切り取りました`)
        }
        if(ev.message.split(` `)[0] === `\\\\r`) {
            const A_x = ev.sender.location.x;
            const A_z = ev.sender.location.z;
            // 円の半径
            const r = Number(ev.message.split(` `)[1]);
            // 度数からラジアンへの変換関数
            function degreesToRadians(degrees) {
                return (degrees * Math.PI) / 180;
            }
            // 座標を取得する関数
            function getCoordinates(angleDegrees, centerX, centerZ, radius) {
                const angleRadians = degreesToRadians(angleDegrees);
                const x = centerX + radius * Math.cos(angleRadians);
                const z = centerZ + radius * Math.sin(angleRadians);
                return { x, z };
            }
            // 1度ずつ右方向に回転しながら座標を取得する
            for (let angle = 0; angle < 360; angle++) {
                const { x, z } = getCoordinates(angle, A_x, A_z, r);
                world.getDimension(`overworld`).fillBlocks({x: x,y: ev.sender.location.y,z: z},{x: x,y: ev.sender.location.y,z: z},BlockPermutation.resolve(`minecraft:${ev.message.split(` `)[2]}`))
            }
        }
        if(ev.message.split(` `)[0] === `\\\\star`) {

        }
        if(ev.message.split(` `)[0] === `\\\\c`) {
            // 点Aの座標
            const A_x = ev.sender.location.x;
            const A_y = ev.sender.location.y;
            const A_z = ev.sender.location.z;

            // 円の半径
            const r = Number(ev.message.split(` `)[1]);

            // 度数からラジアンへの変換関数
            function degreesToRadians(degrees) {
                return (degrees * Math.PI) / 180;
            }

            // 座標を取得する関数
            function getCoordinates(latitudeDegrees, longitudeDegrees, centerX, centerY, centerZ, radius) {
                const latitudeRadians = degreesToRadians(latitudeDegrees);
                const longitudeRadians = degreesToRadians(longitudeDegrees);
                const x = centerX + radius * Math.cos(longitudeRadians) * Math.sin(latitudeRadians);
                const y = centerY + radius * Math.sin(longitudeRadians) * Math.sin(latitudeRadians);
                const z = centerZ + radius * Math.cos(latitudeRadians);
                return { x, y, z };
            }

            // 全ての座標を取得する
            for (let latitude = -180; latitude <= 180; latitude++) {
                system.run(()=>{
                    for (let longitude = 0; longitude < 180; longitude++) {
                    const { x, y, z } = getCoordinates(latitude, longitude, A_x, A_y, A_z, r);
                    world.getDimension(`overworld`).fillBlocks({x: x,y: y,z: z},{x: x,y: y,z: z},BlockPermutation.resolve(`minecraft:${ev.message.split(` `)[2]}`))
                }
                })
            }
        }
        if(ev.message.startsWith(`\\\\kaiten`)) {
            if(typeof startVector.get(ev.sender.name) === 'undefined' || typeof endVector.get(ev.sender.name) === 'undefined') {
                ev.sender.sendMessage(`§c範囲を選択できていません。`)
                return;
            }
            ev.sender.runCommandAsync(`structure save "${ev.sender.name}" ${startVector.get(ev.sender.name)} ${endVector.get(ev.sender.name)}`)
            ev.sender.runCommandAsync(`fill ${startVector.get(ev.sender.name)} ${endVector.get(ev.sender.name)} air`)
            ev.sender.runCommandAsync(`structure load "${ev.sender.name}" ${minZahyo[0]} ${minZahyo[1]} ${minZahyo[2]} 90_degrees`)
            ev.sender.sendMessage(`§a(${startVector.get(ev.sender.name)}) から (${endVector.get(ev.sender.name)}) を90度回転させました`)
        }
        if(ev.message === `\\\\paste`) {
            if(typeof degrees.get(ev.sender.name) !== 'undefined') ev.sender.runCommandAsync(`structure load "${ev.sender.name}" ${ev.sender.location.x} ${ev.sender.location.y} ${ev.sender.location.z} ${degrees.get(ev.sender.name)}_degrees`)
            if(typeof degrees.get(ev.sender.name) === 'undefined') ev.sender.runCommandAsync(`structure load "${ev.sender.name}" ${ev.sender.location.x} ${ev.sender.location.y} ${ev.sender.location.z}`)
            ev.sender.sendMessage(`§a貼り付けました\n§c※出来てない場合、範囲が広い世界の読み込み範囲外にある可能性があります`)
        }
        if(ev.message.startsWith(`\\\\rotate`)) {
            degrees.set(ev.sender.name,ev.message.split(`-`)[1])
        }
        if(ev.message.startsWith(`\\\\set`)) {
            if(typeof startVector.get(ev.sender.name) === 'undefined' || typeof endVector.get(ev.sender.name) === 'undefined') {
                ev.sender.sendMessage(`§c範囲を選択できていません。`)
                return;
            }
            if(ev.message.split(` `)[1] !== `0`) ev.sender.runCommand(`fill ${startVector.get(ev.sender.name)} ${endVector.get(ev.sender.name)} ${ev.message.split(/(?<=^[^ ]+?) /)[1]}`)
            ev.sender.sendMessage(`§a(${startVector.get(ev.sender.name)}) から (${endVector.get(ev.sender.name)}) を${ev.message.split(` `)[1]}にしました\n§c※出来てない場合、範囲が広い世界の読み込み範囲外にある可能性があります`)
        }
        if(ev.message.startsWith(`\\\\outline`)) {
            if(typeof startVector.get(ev.sender.name) === 'undefined' || typeof endVector.get(ev.sender.name) === 'undefined') {
                ev.sender.sendMessage(`§c範囲を選択できていません。`)
                return;
            }
            if(ev.message.split(` `)[1] !== `0`) ev.sender.runCommandAsync(`fill ${startVector.get(ev.sender.name)} ${endVector.get(ev.sender.name)} ${ev.message.split(/(?<=^[^ ]+?) /)[1]} outline`)
            ev.sender.sendMessage(`§a(${startVector.get(ev.sender.name)}) から (${endVector.get(ev.sender.name)}) を${ev.message.split(` `)[1]}にしました\n§c※出来てない場合、範囲が広い世界の読み込み範囲外にある可能性があります`)
        }
    }
})