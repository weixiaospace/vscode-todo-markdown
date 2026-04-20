import * as assert from 'node:assert'
import * as vscode from 'vscode'

const EXT_ID = 'weixiao-space.todo-markdown'

suite('Todo (Markdown) — activation & commands', () => {
  test('extension is present', () => {
    assert.ok(vscode.extensions.getExtension(EXT_ID), `extension ${EXT_ID} not found`)
  })

  test('extension activates', async () => {
    const ext = vscode.extensions.getExtension(EXT_ID)
    assert.ok(ext)
    await ext.activate()
    assert.strictEqual(ext.isActive, true)
  })

  test('all five commands are registered', async () => {
    const ext = vscode.extensions.getExtension(EXT_ID)
    await ext?.activate()
    const all = await vscode.commands.getCommands(true)
    const required = [
      'todoMd.refresh',
      'todoMd.openFile',
      'todoMd.openSettings',
      'todoMd.createFile',
      'todoMd.reveal',
      'todoMd.toggle',
      'todoMd.reopen',
    ]
    for (const id of required) {
      assert.ok(all.includes(id), `command ${id} not registered`)
    }
  })

  test('executing todoMd.refresh does not throw', async () => {
    const ext = vscode.extensions.getExtension(EXT_ID)
    await ext?.activate()
    // 即使 workspace 没打开，refresh 也应该优雅处理
    await vscode.commands.executeCommand('todoMd.refresh')
  })
})
