# ==========================================
# 斯普拉遁 3 地图替换 Mod 终极稳健版脚本 (无涂鸦版)
# 目标：鬼头刀度假区 -> 鲑坝
# ==========================================

# --- 1. 变量配置 ---
export UNPACK_ROOT="/Users/space4/Downloads/ryujinx/splatoon3-unpack"
export MOD_ROOT="/Users/space4/Library/Application Support/Ryujinx/mods/contents/0100c2500fc20000/鲑坝"
export WORK="temp/mod_workspace_stable"

# 环境清理
rm -rf "$WORK" && mkdir -p "$WORK/params" "$WORK/ghost" "$WORK/salmon"
mkdir -p "$MOD_ROOT/romfs/Pack/Scene"

# --- 2. 处理 Params.pack.zs (清空 Banc) ---
echo "[1/4] 正在处理 Params.pack.zs..."
node ./dist/cli.js unpack "$UNPACK_ROOT/romfs/Pack/Params.pack.zs" "$WORK/params"
rm -rf "$WORK/params/Banc"
node ./dist/cli.js pack "$WORK/params" "$MOD_ROOT/romfs/Pack/Params.pack.zs" -z

# --- 3. 场景包手术台准备 (全量解包鬼头刀作为地基) ---
echo "[2/4] 正在解压资产基底..."
node ./dist/cli.js unpack "$UNPACK_ROOT/romfs/Pack/Scene/Vss_Hiagari04.pack.zs" "$WORK/ghost"
node ./dist/cli.js unpack "$UNPACK_ROOT/romfs/Pack/Scene/Cop_Shakeup.pack.zs" "$WORK/salmon"

# --- 4. 核心手术式注入 (布局+海水+环境+移除涂鸦) ---
echo "[3/4] 正在执行核心注入与涂鸦移除..."

# [注入 A] 布局 (bcett) - 保持鬼头刀内部文件名
cp "$WORK/salmon/Banc/Cop_Shakeup.bcett.byml" "$WORK/ghost/Banc/Vss_Hiagari04.bcett.byml"

# [注入 B] 海水参数 (Ocean) - 保持鬼头刀内部文件名
cp "$WORK/salmon/Gyml/Cop_Default.game__gfx__parameter__Ocean.bgyml" \
   "$WORK/ghost/Gyml/Vss_Hiagari03Water.game__gfx__parameter__Ocean.bgyml"

# [注入 C] 环境与引用修复 (RenderingDay)
node ./dist/cli.js deyaml "$WORK/salmon/Gyml/Cop_ShakeupDay.game__gfx__parameter__RenderingDay.bgyml" "$WORK/rd.yaml"
sed -i '' 's/Cop_Default/Vss_Hiagari03Water/g' "$WORK/rd.yaml"
node ./dist/cli.js yaml2byml "$WORK/rd.yaml" "$WORK/ghost/Gyml/Vss_Hiagari04.game__gfx__parameter__RenderingDay.bgyml"

# [注入 D] 彻底移除涂鸦组件 (SceneParam 级手术)
echo "正在从 SceneParam 中剥离涂鸦组件..."
node ./dist/cli.js deyaml "$WORK/ghost/Scene/Vss_Hiagari04.engine__scene__SceneParam.bgyml" "$WORK/sp.yaml"
node -e "
const fs = require('fs');
const yaml = require('js-yaml');
const content = fs.readFileSync('$WORK/sp.yaml', 'utf8');
const docs = yaml.loadAll(content);
if (docs[1] && docs[1].Components) {
  delete docs[1].Components.SceneGraffitiPlacementData;
}
const out = yaml.dump(docs[0]) + '---\n' + yaml.dump(docs[1], {indent: 2, quotingType: '\"'});
fs.writeFileSync('$WORK/sp_no_grf.yaml', out);
"
node ./dist/cli.js yaml2byml "$WORK/sp_no_grf.yaml" "$WORK/ghost/Scene/Vss_Hiagari04.engine__scene__SceneParam.bgyml"

# --- 5. 最终封装与安装 ---
echo "[4/4] 正在生成最终场景包..."
node ./dist/cli.js pack "$WORK/ghost" "$MOD_ROOT/romfs/Pack/Scene/Vss_Hiagari04.pack.zs" -z

echo "=========================================="
echo "Mod 制作完成！(已移除原始涂鸦并对齐打工模式结构)"
echo "安装路径: $MOD_ROOT"
