use bevy::prelude::*;
use bevy::ui::entity::TextBundle;
use crate::select::Selectable;

// components
#[derive(Component)]
pub struct Configurable;

#[derive(Component)]
pub struct Setting;

// bundle
#[derive(Bundle)] 
pub struct SettingsBundle {
  #[bundle]
  text: TextBundle,
  setting: Setting,
  selectable: Selectable,
}

impl SettingsBundle {
  fn new(label: impl Into<String>, height: f32, style: &TextStyle) -> Self {
    return Self {
      text: TextBundle::from_section(label, style.clone())
        .with_text_alignment(TextAlignment::CENTER_LEFT)
        .with_style(Style {
          align_self: AlignSelf::Auto,
          position_type: PositionType::Absolute,
          position: UiRect {
              top: Val::Percent(height * 100.),
              right: Val::Percent(3.),
              ..default()
          },
          ..default()}),
      setting: Setting,
      selectable: Selectable,
    }
  }
}

#[derive(Component)]
pub struct Pitch;
#[derive(Component)]
pub struct Gain;

// systems
pub fn spawn (
  mut commands: Commands,
  asset_server: Res<AssetServer>
){
  let style = TextStyle {
    font_size: 42.,
    color: Color::WHITE,
    font: asset_server.load("SpaceMono-Regular.ttf"),
  };

  // add controls
  commands.spawn()
    .insert(Pitch)
    .insert_bundle(SettingsBundle::new("pitch", 0.4, &style));

  commands.spawn()
    .insert(Gain)
    .insert_bundle(SettingsBundle::new("gain", 0.5, &style));
}

