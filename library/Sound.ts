/*
 *  Wrapper class for HTML5 Audio
 */
class Sound {
  /// The sound
  private mSound: HTMLAudioElement;

  constructor(srcFile: string) {
    this.mSound = document.createElement("audio");
    this.mSound.src = srcFile;
    this.mSound.preload = "auto";
    this.mSound.controls = false;
    this.mSound.style.display = "none";
    this.mSound.autoplay = false;
    this.mSound.loop = false;
    this.mSound.muted = false;
    document.body.appendChild(this.mSound);
  }

  /*
   *  Play the sound with no loop
   */
  public play(): void {
    this.mSound.play();
  }

  /*
   *  Stop/pause the sound
   */
  public stop(): void {
    this.mSound.pause();
  }

  /*
   *  Set if the sound will loop when played
   *  @param loop True to loop, false to turn off looping
   */
  public setLooping(loop: boolean): void {
    this.mSound.loop = loop;
  }

  /*
   *  Mute or unmute sound
   *  @param mute True to mute, false to unmute
   */
  public mute(mute: boolean): void {
    this.mSound.muted = mute;
  }
}
