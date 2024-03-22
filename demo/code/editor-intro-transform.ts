class Transform {
  /**
   * 计算的逻辑：
   * @see https://zbqq3ri6o0.feishu.cn/docs/doccnapGd3Ldm2TCvOWLe1fQdLe#d3LEuM
   */
  updateMatrix() {
    if (!this.isMatrixNeedsUpdate) return
    this.matrix = mat3.create()

    const translation = mat3.fromTranslation(mat3.create(), [
      this.position.lng,
      this.position.lat,
    ])
    const rotation = mat3.fromRotation(
      mat3.create(),
      (this.angle / 180) * Math.PI,
    )
    const scaling = mat3.fromScaling(mat3.create(), [
      this.scale.x,
      this.scale.y,
    ])

    mat3.multiply(this.matrix, this.matrix, translation)
    mat3.multiply(this.matrix, this.matrix, rotation)
    mat3.multiply(this.matrix, this.matrix, scaling)

    this.updateWorldMatrix()

    this.isMatrixNeedsUpdate = false
  }

  updateWorldMatrix() {
    if (this.parent) {
      // if parent world matrix is null ?
      if (this.parent.worldMatrix === null) {
        this.parent.updateMatrix()
        return
      }

      if (this.matrix === null) {
        this.updateMatrix()
        return
      }

      this.worldMatrix = mat3.create()
      mat3.multiply(this.worldMatrix, this.parent.worldMatrix, this.matrix)
    } else {
      this.worldMatrix = mat3.clone(this.matrix)
    }

    this.worldMatrixInvert = mat3.create()
    mat3.invert(this.worldMatrixInvert, this.worldMatrix)

    for (const child of this.children) {
      child.updateWorldMatrix()
    }
  }
}
