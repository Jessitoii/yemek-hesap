const { withAndroidManifest } = require('@expo/config-plugins');

module.exports = function withHealthConnect(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults;
    const app = manifest.manifest.application[0];

    // Find MainActivity
    const mainActivity = app.activity.find(
      (a) => a.$['android:name'] === '.MainActivity'
    );

    if (mainActivity) {
      // Android 13 and below: ACTION_SHOW_PERMISSIONS_RATIONALE
      const hasRationale = (mainActivity['intent-filter'] || []).some(
        (f) => f.action?.[0]?.['$']?.['android:name'] === 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE'
      );
      if (!hasRationale) {
        if (!mainActivity['intent-filter']) mainActivity['intent-filter'] = [];
        mainActivity['intent-filter'].push({
          action: [{ $: { 'android:name': 'androidx.health.ACTION_SHOW_PERMISSIONS_RATIONALE' } }],
        });
      }

      // Android 14+: VIEW_PERMISSION_USAGE with HEALTH_PERMISSIONS category
      const hasViewPermission = (mainActivity['intent-filter'] || []).some(
        (f) => f.action?.[0]?.['$']?.['android:name'] === 'android.intent.action.VIEW_PERMISSION_USAGE'
      );
      if (!hasViewPermission) {
        mainActivity['intent-filter'].push({
          action: [{ $: { 'android:name': 'android.intent.action.VIEW_PERMISSION_USAGE' } }],
          category: [{ $: { 'android:name': 'android.intent.category.HEALTH_PERMISSIONS' } }],
        });
      }
    }

    // activity-alias required for Android 14+ permission rationale screen
    if (!app['activity-alias']) app['activity-alias'] = [];
    const hasAlias = app['activity-alias'].some(
      (a) => a.$['android:name'] === 'ViewPermissionUsageActivity'
    );
    if (!hasAlias) {
      app['activity-alias'].push({
        $: {
          'android:name': 'ViewPermissionUsageActivity',
          'android:exported': 'true',
          'android:targetActivity': '.MainActivity',
          'android:permission': 'android.permission.START_VIEW_PERMISSION_USAGE',
        },
        'intent-filter': [
          {
            action: [{ $: { 'android:name': 'android.intent.action.VIEW_PERMISSION_USAGE' } }],
            category: [{ $: { 'android:name': 'android.intent.category.HEALTH_PERMISSIONS' } }],
          },
        ],
      });
    }

    return config;
  });
};
